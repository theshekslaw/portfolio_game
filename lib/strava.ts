import 'server-only';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { oauthTokens } from '@/db/schema';
import { getDb } from './db';
import type { PageContent } from './types';

// Live Running page from the Strava API. Runs recorded on the Garmin sync to Strava, so this covers both.

const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun']);

interface Activity {
  id: number; name: string; sport_type: string; distance: number; moving_time: number;
  start_date: string; start_date_local: string; device_name?: string; map?: { summary_polyline?: string };
}
interface Totals { count: number; distance: number; moving_time: number }
interface Stats { recent_run_totals: Totals; ytd_run_totals: Totals; all_run_totals: Totals }

// Access tokens last 6 h; the current one (and the latest refresh token, which Strava may rotate) is kept in
// Neon. Without the DB it falls back to refreshing from the env token every time.
async function accessToken(): Promise<string> {
  const { STRAVA_CLIENT_ID: id, STRAVA_CLIENT_SECRET: secret, STRAVA_REFRESH_TOKEN: envRefresh } = process.env;
  if (!id || !secret || !envRefresh) throw new Error('Strava credentials not set');
  let db: ReturnType<typeof getDb> | null = null;
  let stored: typeof oauthTokens.$inferSelect | undefined;
  try {
    db = getDb();
    [stored] = await db.select().from(oauthTokens).where(eq(oauthTokens.provider, 'strava'));
  } catch {
    db = null;
  }
  if (stored && stored.expiresAt.getTime() > Date.now() + 60_000) return stored.accessToken;

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: stored?.refreshToken ?? envRefresh, grant_type: 'refresh_token' }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Strava token refresh: ${res.status}`);
  const t: { access_token: string; refresh_token: string; expires_at: number } = await res.json();
  const row = { refreshToken: t.refresh_token, accessToken: t.access_token, expiresAt: new Date(t.expires_at * 1000), updatedAt: new Date() };
  await db?.insert(oauthTokens).values({ provider: 'strava', ...row }).onConflictDoUpdate({ target: oauthTokens.provider, set: row });
  return t.access_token;
}

// Privacy: drop this much of every route at both ends so the drawing never shows where a run starts or
// finishes (usually home), like Strava's "hide start and end points".
const HIDE_ENDS_M = 500;
const metres = (a: [number, number], b: [number, number]) => {
  const R = 6371000, toRad = Math.PI / 180, dLat = (b[0] - a[0]) * toRad, dLng = (b[1] - a[1]) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toRad) * Math.cos(b[0] * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Google encoded polyline -> SVG path fitted into a 160x90 box, ends trimmed (Strava's summary_polyline).
function routePath(encoded: string): string | undefined {
  const pts: [number, number][] = [];
  let i = 0, lat = 0, lng = 0;
  while (i < encoded.length) {
    for (const axis of [0, 1]) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const d = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lat += d; else lng += d;
    }
    pts.push([lat / 1e5, lng / 1e5]);
  }
  const along = [0];
  for (let j = 1; j < pts.length; j++) along.push(along[j - 1] + metres(pts[j - 1], pts[j]));
  const total = along[along.length - 1];
  const kept = pts.filter((_, j) => along[j] >= HIDE_ENDS_M && along[j] <= total - HIDE_ENDS_M);
  if (kept.length < 2) return undefined;
  pts.splice(0, pts.length, ...kept);
  const k = Math.cos((pts[0][0] * Math.PI) / 180);
  const xy = pts.map(([la, lo]) => [lo * k, -la]);
  const xs = xy.map((p) => p[0]), ys = xy.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min(144 / (maxX - minX || 1), 74 / (maxY - minY || 1));
  const ox = (160 - (maxX - minX) * scale) / 2, oy = (90 - (maxY - minY) * scale) / 2;
  const step = Math.max(1, Math.floor(xy.length / 200));
  return xy
    .filter((_, j) => j % step === 0 || j === xy.length - 1)
    .map(([x, y], j) => `${j ? 'L' : 'M'}${(ox + (x - minX) * scale).toFixed(1)} ${(oy + (y - minY) * scale).toFixed(1)}`)
    .join('');
}

const km = (m: number) => (m / 1000).toFixed(1);
const pace = (a: Activity) => { const s = a.moving_time / (a.distance / 1000); return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`; };
const day = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const totals = (label: string, t: Totals) => `${label}: ${t.count} runs · ${km(t.distance)} km`;

async function fetchStrava(): Promise<PageContent | null> {
  // Server-only: the athlete id / profile is never sent to the browser (visitors can't find the Strava profile).
  const athlete = process.env.STRAVA_ATHLETE_ID;
  if (!athlete) return null;
  const token = await accessToken();
  const H = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as const };
  const [statsRes, actsRes] = await Promise.all([
    fetch(`https://www.strava.com/api/v3/athletes/${athlete}/stats`, H),
    fetch('https://www.strava.com/api/v3/athlete/activities?per_page=50', H),
  ]);
  if (!statsRes.ok || !actsRes.ok) throw new Error(`Strava API: ${statsRes.status}/${actsRes.status}`);
  const stats: Stats = await statsRes.json();
  const runs = ((await actsRes.json()) as Activity[]).filter((a) => RUN_TYPES.has(a.sport_type) && a.distance > 0);
  if (!runs.length) return null;
  const week = runs.filter((a) => Date.parse(a.start_date) > Date.now() - 7 * 24 * 3600 * 1000);
  return {
    nowLabel: 'Last 7 days',
    now: {
      value: `${km(week.reduce((s, a) => s + a.distance, 0))} km`,
      meta: `${week.length} ${week.length === 1 ? 'run' : 'runs'}`,
      note: [totals('Last 4 weeks', stats.recent_run_totals), totals('This year', stats.ytd_run_totals), totals('All time', stats.all_run_totals)].join('  ·  '),
    },
    items: runs.slice(0, 4).map((a, i) => ({
      tag: i === 0 ? 'Last run' : 'Run',
      title: `${km(a.distance)} km · ${pace(a)} /km`,
      note: [a.name, day(a.start_date_local), a.device_name].filter(Boolean).join(' · '),
      visual: { kind: 'route' as const, path: a.map?.summary_polyline ? routePath(a.map.summary_polyline) : undefined },
      // No per-activity link: a public activity page shows the full map, including where the run started.
    })),
  };
}

// Cached for an hour (keeps well inside Strava's 1,000 requests/day); errors are not cached.
const cachedStrava = unstable_cache(fetchStrava, ['strava-running-v2'], { revalidate: 3600 });

export async function getStravaContent(): Promise<PageContent | null> {
  try {
    return await cachedStrava();
  } catch (err) {
    console.warn('Strava content unavailable:', (err as Error).message);
    return null;
  }
}
