import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import pg from 'pg';
import { createPrismaClient } from '../../dist/prisma.js';

export const sqlTestOptions = {
  skip: process.env.TEST_DATABASE_URL
    ? false
    : 'Set TEST_DATABASE_URL to a dedicated PostgreSQL database ending in _test',
};

// Each test gets its own schema. No tables in the development database are used.
export async function createTestDatabase(t, { throughMigration } = {}) {
  assert.ok(process.env.TEST_DATABASE_URL, 'TEST_DATABASE_URL is required');
  const url = new URL(process.env.TEST_DATABASE_URL);
  assert.ok(
    decodeURIComponent(url.pathname.slice(1)).endsWith('_test'),
    'Test database name must end in _test',
  );
  const schema = `routes_test_${randomUUID().replaceAll('-', '')}`;
  assert.match(schema, /^routes_test_[a-f0-9]{32}$/);
  url.searchParams.set('options', `-c search_path=${schema}`);
  url.searchParams.set('schema', schema);
  const pool = new pg.Pool({
    connectionString: url.toString(),
    connectionTimeoutMillis: 5000,
  });
  const query = pool.query.bind(pool);
  let created = false;
  let prisma;
  t.after(async () => {
    try {
      await prisma?.$disconnect();
      if (created) await query(`DROP SCHEMA "${schema}" CASCADE`);
    } finally {
      await pool.end();
    }
  });

  const database = await query('SELECT current_database() AS name');
  assert.equal(
    database.rows[0].name,
    decodeURIComponent(url.pathname.slice(1)),
  );
  await query(`CREATE SCHEMA "${schema}"`);
  created = true;
  const selected = await query('SELECT current_schema() AS name');
  assert.equal(selected.rows[0].name, schema);

  const directory = new URL('../../prisma/migrations/', import.meta.url);
  const migrations = (await readdir(directory))
    .filter((name) => /^\d/.test(name))
    .sort();
  if (throughMigration) assert.ok(migrations.includes(throughMigration));
  for (const filename of migrations) {
    await query(
      await readFile(new URL(`${filename}/migration.sql`, directory), 'utf8'),
    );
    if (filename === throughMigration) break;
  }
  prisma = createPrismaClient(url.toString());
  return { pool, prisma, url: url.toString() };
}
