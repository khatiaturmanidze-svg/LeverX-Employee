import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import type { Pool } from 'pg';

const PgSessionStore = connectPgSimple(session);

export function createSessionStore(
  pool: Pool,
  schemaName: string,
  pruneSessionInterval: number | false = 15 * 60,
) {
  return new PgSessionStore({
    pool,
    schemaName,
    tableName: 'web_sessions',
    createTableIfMissing: false,
    pruneSessionInterval,
    errorLog: () => console.error({ event: 'session_store_failed' }),
  });
}
