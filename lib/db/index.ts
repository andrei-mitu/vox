import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  db?: DrizzleDb;
};

function getDb(): DrizzleDb {
  if (globalForDb.db) return globalForDb.db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing required env: DATABASE_URL');
  }

  const pgClient = globalForDb.pgClient ?? postgres(connectionString, {
    ssl:             process.env.NODE_ENV === 'production',
    max:             10,
    idle_timeout:    30,
    connect_timeout: 10,
  });
  globalForDb.pgClient = pgClient;

  const instance = drizzle(pgClient, { schema });
  globalForDb.db = instance;

  return instance;
}

export { getDb as db };
export type DB = DrizzleDb;
