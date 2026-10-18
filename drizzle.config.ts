import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';
import { withVerifiedSsl } from './db/url';

loadEnvConfig(process.cwd());

// Migrations run over the direct (unpooled) connection; the app uses the pooled DATABASE_URL.
export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: withVerifiedSsl(process.env.DATABASE_URL_UNPOOLED!) },
});
