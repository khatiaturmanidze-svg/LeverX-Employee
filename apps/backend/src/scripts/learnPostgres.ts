import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createPostgresPool } from '../postgres.js';

const backendDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
dotenv.config({ path: path.resolve(backendDir, '../../.env'), quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = createPostgresPool();
try {
  // Replacement excerpt for the lab, not a second complete file.
  const result = await pool.query<{ received_id: string }>(
    'SELECT $2::text AS first, $1::text AS second',
    ['A', 'B'],
  );
  console.log(result.rows);
} finally {
  await pool.end();
}
