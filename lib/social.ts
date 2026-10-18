import 'server-only';
import { handleOf, pages } from './data';
import type { PageContent } from './types';

// Live content for the GitHub and YouTube pages. Upstream responses are cached for an hour; any failure
// returns null so the page keeps its tokens.json copy.
const HOUR = { next: { revalidate: 3600 } };

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const join = (parts: (string | number | null | undefined)[]) => parts.filter((p) => p !== null && p !== undefined && p !== '').join(' · ');

interface Repo { name: string; html_url: string; fork: boolean; description: string | null; language: string | null; stargazers_count: number; pushed_at: string }
interface GhEvent { type: string; created_at: string }

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, ...HOUR });
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return res.json();
}

export async function getGitHubContent(): Promise<PageContent | null> {
  const url = process.env.NEXT_PUBLIC_GITHUB_URL;
  if (!url) return null;
  const login = handleOf(url);
  try {
    const [user, repos, events] = await Promise.all([
      gh<{ public_repos: number }>(`/users/${login}`),
      gh<Repo[]>(`/users/${login}/repos?sort=pushed&per_page=20`),
      gh<GhEvent[]>(`/users/${login}/events/public?per_page=100`),
    ]);
    const own = repos.filter((r) => !r.fork);
    if (!own.length) return null;
    const [latest, ...rest] = own;
    const since = Date.now() - 30 * 24 * 3600 * 1000;
    const pushes = events.filter((e) => e.type === 'PushEvent' && Date.parse(e.created_at) > since).length;
    return {
      nowLabel: 'Latest work',
      now: {
        value: latest.name,
        href: latest.html_url,
        meta: join([`Updated ${fmtDate(latest.pushed_at)}`, latest.language, latest.stargazers_count ? `${latest.stargazers_count} ★` : null]),
        note: latest.description ?? '',
      },
      items: [
        ...rest.slice(0, 2).map((r) => ({ tag: 'Repo', title: r.name, href: r.html_url, note: join([r.description, r.language, `updated ${fmtDate(r.pushed_at)}`]) })),
        { tag: 'Activity', title: `${pushes} ${pushes === 1 ? 'push' : 'pushes'} in the last 30 days`, note: `@${login} · ${user.public_repos} public repos` },
      ],
    };
  } catch (err) {
    console.warn('GitHub content unavailable:', (err as Error).message);
    return null;
  }
}

const decode = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

export async function getYouTubeContent(): Promise<PageContent | null> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID, url = process.env.NEXT_PUBLIC_YOUTUBE_URL;
  if (!channelId || !url) return null;
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, HOUR);
    if (!res.ok) throw new Error(`YouTube feed: ${res.status}`);
    const xml = await res.text();
    const videos = xml.split('<entry>').slice(1).map((e) => {
      const get = (re: RegExp) => decode(e.match(re)?.[1] ?? '');
      return {
        title: get(/<title>([\s\S]*?)<\/title>/),
        published: get(/<published>(.*?)<\/published>/),
        views: Number(get(/views="(\d+)"/) || 0),
        description: get(/<media:description>([\s\S]*?)<\/media:description>/),
        href: get(/<link rel="alternate" href="(.*?)"/),
        thumbnail: get(/<media:thumbnail url="(.*?)"/),
      };
    });
    if (!videos.length) return null;
    const [latest, ...rest] = videos;
    const firstLine = latest.description.split('\n').find((l) => l.trim()) ?? '';
    return {
      now: {
        value: latest.title,
        meta: join([fmtDate(latest.published), `${latest.views.toLocaleString('en-US')} views`]),
        note: firstLine.length > 220 ? firstLine.slice(0, 217) + '…' : firstLine,
        visual: { kind: 'video', src: latest.thumbnail },
        href: latest.href,
      },
      items: [
        ...rest.slice(0, 2).map((v) => ({ tag: 'Video', title: v.title, note: join([`${v.views.toLocaleString('en-US')} views`, fmtDate(v.published)]), visual: { kind: 'video' as const, src: v.thumbnail }, href: v.href })),
        // RSS has no subscriber count, so the Channel card keeps its tokens.json copy.
        ...pages['soc:YouTube'].items.slice(-1),
      ],
    };
  } catch (err) {
    console.warn('YouTube content unavailable:', (err as Error).message);
    return null;
  }
}
