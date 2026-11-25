import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({
  path: new URL('../../../.env.test', import.meta.url),
  quiet: true,
});

async function main() {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      'Set TEST_DATABASE_URL in the environment or repository-root .env.test. Copy .env.test.example to get started.',
    );
  }
  const url = new URL(process.env.TEST_DATABASE_URL);
  const database = decodeURIComponent(url.pathname.slice(1));
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !database.endsWith('_test')
  ) {
    throw new Error(
      'TEST_DATABASE_URL must point to a PostgreSQL database ending in _test.',
    );
  }

  if (process.argv.includes('--setup')) {
    const adminUrl = new URL(url);
    adminUrl.pathname = '/postgres';
    adminUrl.searchParams.delete('schema');
    adminUrl.searchParams.delete('options');
    const admin = new pg.Client({
      connectionString: adminUrl.toString(),
      connectionTimeoutMillis: 5000,
    });
    try {
      await admin.connect();
      const existing = await admin.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [database],
      );
      if (!existing.rowCount) {
        const identifier = '"' + database.replaceAll('"', '""') + '"';
        await admin.query(`CREATE DATABASE ${identifier}`);
        console.log(`Created test database ${database}.`);
      } else {
        console.log(`Test database ${database} already exists.`);
      }
    } finally {
      await admin.end();
    }
  }

  const client = new pg.Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    await client.query('SELECT 1');
  } finally {
    await client.end();
  }
  if (process.argv.includes('--setup')) return;

  const directory = new URL('../tests/', import.meta.url);
  const tests = (await readdir(directory))
    .filter((name) => name.endsWith('.test.js'))
    .sort()
    .map((name) => fileURLToPath(new URL(name, directory)));
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--test', ...tests], {
      env: process.env,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
  process.exitCode = exitCode;
}

main().catch((error) => {
  console.error(`Integration test setup failed: ${error.message}`);
  console.error(
    'Check PostgreSQL is running, the test URL credentials are valid, and run npm run test:db:setup --workspace=@mono/backend.',
  );
  process.exitCode = 1;
});
