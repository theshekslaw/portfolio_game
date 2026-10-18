import 'server-only';
import { attachDatabasePool } from '@vercel/functions';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import { withVerifiedSsl } from '@/db/url';

let db: NodePgDatabase<typeof schema> | null = null;

// Created lazily so `next build` and pages that never touch the DB work without DATABASE_URL.
export function getDb() {
  if (db) return db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const pool = new Pool({ connectionString: withVerifiedSsl(connectionString), idleTimeoutMillis: 5000 });
  attachDatabasePool(pool);
  db = drizzle(pool, { schema });
  return db;
}
