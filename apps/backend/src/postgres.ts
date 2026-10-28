import pg from 'pg';

export function createPostgresPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  return new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
}
