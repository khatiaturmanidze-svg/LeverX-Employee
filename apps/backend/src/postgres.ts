import pg from 'pg';

export function createPostgresPool() {
  return new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
}
