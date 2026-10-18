import tokens from '@/data/tokens.json';
import type { Category, ModeKey, Page, ProfileLink, Theme } from './types';

// Profile URLs come from NEXT_PUBLIC_* env vars (inlined at build time); each must be referenced
// literally for Next.js to inline it. Missing ones keep the tokens.json placeholder.
const PROFILES: Record<string, string | undefined> = {
  LinkedIn: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  GitHub: process.env.NEXT_PUBLIC_GITHUB_URL,
  YouTube: process.env.NEXT_PUBLIC_YOUTUBE_URL,
  Instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  'X / Twitter': process.env.NEXT_PUBLIC_X_URL,
  'Hugging Face': process.env.NEXT_PUBLIC_HUGGINGFACE_URL,
  Kaggle: process.env.NEXT_PUBLIC_KAGGLE_URL,
  LeetCode: process.env.NEXT_PUBLIC_LEETCODE_URL,
};

// Last path segment of a profile URL: ".../in/abhishek-pandey-272a882a9/" -> "abhishek-pandey-272a882a9", ".../@theshekslaw" -> "theshekslaw".
export const handleOf = (url: string) => (new URL(url).pathname.split('/').filter(Boolean).pop() ?? '').replace(/^@/, '');

const withHandle = <T,>(value: T, handle: string): T =>
  JSON.parse(JSON.stringify(value).replaceAll('[HANDLE]', handle));

const rawPages = tokens.pages as Record<string, Page>;
const rawCatalog = tokens.catalog as Category[];

// Profile links shown on a profession view (Hugging Face and Kaggle on ML) take their URL from PROFILES too.
export const professions = Object.fromEntries(
  Object.entries(tokens.professions as Record<ModeKey, Theme>).map(([key, th]) => [
    key,
    {
      ...th,
      ...(th.links && { links: th.links.map((l) => ({ ...l, href: PROFILES[l.label] ?? l.href })) }),
    },
  ]),
) as Record<ModeKey, Theme>;

export const pages: Record<string, Page> = Object.fromEntries(
  Object.entries(rawPages).map(([key, page]) => {
    const url = key.startsWith('soc:') ? PROFILES[key.slice(4)] : undefined;
    const withUrl = url ? { ...withHandle(page, handleOf(url)), href: url } : page;
    const links = page.links?.map((l) => ({ ...l, href: PROFILES[l.label] ?? l.href }));
    return [key, links ? { ...withUrl, links } : withUrl];
  }),
);

export const catalog: Category[] = rawCatalog.map((c) => ({
  ...c,
  items: c.items.map((it) => {
    const url = c.key === 'soc' ? PROFILES[it.label] : undefined;
    return url ? { ...it, href: url } : it;
  }),
}));

export const companies = tokens.companies as ProfileLink[];
