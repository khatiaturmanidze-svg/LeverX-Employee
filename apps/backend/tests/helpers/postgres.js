import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import pg from 'pg';

export const sqlTestOptions = {
  skip: process.env.TEST_DATABASE_URL
    ? false
    : 'Set TEST_DATABASE_URL to a dedicated PostgreSQL database ending in _test',
};

// Each test gets its own schema. No tables in the development database are used.
export async function createTestDatabase(t) {
  assert.ok(process.env.TEST_DATABASE_URL, 'TEST_DATABASE_URL is required');
  const url = new URL(process.env.TEST_DATABASE_URL);
  assert.ok(
    decodeURIComponent(url.pathname.slice(1)).endsWith('_test'),
    'Test database name must end in _test',
  );
  const schema = `routes_test_${randomUUID().replaceAll('-', '')}`;
  assert.match(schema, /^routes_test_[a-f0-9]{32}$/);
  url.searchParams.set('options', `-c search_path=${schema}`);
  const pool = new pg.Pool({
    connectionString: url.toString(),
    connectionTimeoutMillis: 5000,
  });
  const query = pool.query.bind(pool);
  let created = false;
  t.after(async () => {
    try {
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

  const directory = new URL('../../sql/schema/', import.meta.url);
  for (const filename of (await readdir(directory))
    .filter((name) => /^\d+.*\.sql$/.test(name))
    .sort()) {
    await query(await readFile(new URL(filename, directory), 'utf8'));
  }
  return { pool, url: url.toString() };
}
