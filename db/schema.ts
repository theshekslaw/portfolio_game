import { date, integer, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const readingKind = pgEnum('reading_kind', ['book', 'paper']);
export const readingStatus = pgEnum('reading_status', ['reading', 'finished', 'want']);

// Books and papers shown on the Hobbies · Reading page. Files (PDFs) live elsewhere, e.g. a Google Drive
// share link in `url`; only the link is stored here.
export const readingItems = pgTable('reading_items', {
  id: serial('id').primaryKey(),
  kind: readingKind('kind').notNull(),
  title: text('title').notNull(),
  authors: text('authors'),
  status: readingStatus('status').notNull().default('reading'),
  progress: integer('progress'), // 0-100
  note: text('note'),
  venue: text('venue'), // paper venue or book publisher
  year: integer('year'),
  identifier: text('identifier'), // ISBN or arXiv id
  url: text('url'),
  imageUrl: text('image_url'), // book cover; papers get a generated cover
  sortOrder: integer('sort_order'), // reading-list order (lower first)
  startedAt: date('started_at'),
  finishedAt: date('finished_at'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ReadingItem = typeof readingItems.$inferSelect;

// OAuth tokens for providers whose refresh tokens can rotate (Strava). The env refresh token seeds the first row;
// after that the latest token lives here so a rotation is never lost.
export const oauthTokens = pgTable('oauth_tokens', {
  provider: text('provider').primaryKey(),
  refreshToken: text('refresh_token').notNull(),
  accessToken: text('access_token').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
