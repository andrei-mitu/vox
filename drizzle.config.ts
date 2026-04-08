import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Missing required env: DATABASE_URL');

export default defineConfig({
  schema:  './lib/db/schema/index.ts',
  out:     './db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
});
