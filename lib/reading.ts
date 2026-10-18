import 'server-only';
import { asc, desc, sql } from 'drizzle-orm';
import { readingItems, type ReadingItem } from '@/db/schema';
import { getDb } from './db';
import type { PageContent, Visual } from './types';

export async function listReading(): Promise<ReadingItem[]> {
  return getDb()
    .select()
    .from(readingItems)
    .orderBy(sql`${readingItems.sortOrder} asc nulls last`, sql`${readingItems.startedAt} desc nulls last`, desc(readingItems.createdAt), asc(readingItems.id));
}

const join = (parts: (string | number | null | undefined)[]) => parts.filter((p) => p !== null && p !== undefined && p !== '').join(' · ');

const visualOf = (r: ReadingItem): Visual => ({
  kind: r.kind,
  src: r.imageUrl ?? undefined,
  title: r.title,
  caption: join([r.authors, r.year]),
});

// Content for the Reading page from the DB, or null (keep the tokens.json placeholders) when the
// table is empty or the DB is unreachable.
export async function getReadingContent(): Promise<PageContent | null> {
  let rows: ReadingItem[];
  try {
    rows = await listReading();
  } catch (err) {
    console.warn('Reading content unavailable, using tokens.json:', (err as Error).message);
    return null;
  }
  if (!rows.length) return null;
  const reading = rows.find((r) => r.status === 'reading');
  const current = reading ?? rows[0];
  return {
    ...(!reading && { nowLabel: 'Up next' }),
    now: {
      value: current.authors ? `${current.title} — ${current.authors}` : current.title,
      meta: join([current.startedAt && `Started ${current.startedAt}`, current.venue, current.year, current.identifier]),
      note: current.note ?? '',
      progressLabel: 'Progress',
      progress: current.progress === null ? undefined : `${current.progress}%`,
      visual: visualOf(current),
      href: current.url ?? undefined,
    },
    items: rows
      .filter((r) => r !== current)
      .map((r) => ({
        tag: r.kind === 'paper' ? 'Paper' : 'Book',
        title: r.title,
        note: join([r.authors, r.venue, r.year]) + (r.note ? ` — ${r.note}` : ''),
        visual: visualOf(r),
        href: r.url ?? undefined,
      })),
  };
}
