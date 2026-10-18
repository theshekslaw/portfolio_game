import quotes from '@/data/quotes.json';
import { pages } from './data';

export interface Quote { text: string; by: string }

const POOLS = quotes as Record<string, Quote[]>;

// Today's quote for every view (forms + content pages), picked on the server so every visitor sees the same one.
// The day is counted in India time; each view starts at a different offset so they don't change in lockstep.
export function todaysQuotes(now = Date.now()): Record<string, Quote> {
  const day = Math.floor((now + 5.5 * 3600 * 1000) / 86_400_000);
  const views = ['home', 'software', 'ml', 'cloud', 'llmops', ...Object.keys(pages)];
  return Object.fromEntries(
    views.map((view, i) => {
      const pool = POOLS[view] ?? POOLS[view.startsWith('soc:') ? 'social' : 'home'];
      return [view, pool[(day + i * 3) % pool.length]];
    }),
  );
}
