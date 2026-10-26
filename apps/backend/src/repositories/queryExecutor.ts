import type { PoolClient } from 'pg';
export type QueryExecutor = Pick<PoolClient, 'query'>;
