import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createTestDatabase, sqlTestOptions } from './helpers/postgres.js';
import { testSessionOptions, createTestRequest } from './helpers/sessions.js';

async function launch(t, url, snapshotPath) {
  const child = spawn(
    process.execPath,
    [fileURLToPath(new URL('../dist/server.js', import.meta.url))],
    {
      env: {
        ...process.env,
        DATABASE_URL: url,
        DATABASE_PATH: snapshotPath,
        PORT: '0',
        SESSION_SECRET: 'startup-test-session-secret-with-at-least-32-bytes',
        APP_ORIGIN: 'http://localhost:5173',
        NODE_ENV: 'test',
        BCRYPT_SALT_ROUNDS: '4',
        SYNTHETIC_LATENCY_MIN: '',
        SYNTHETIC_LATENCY_MAX: '',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const exited = once(child, 'exit');
  const stop = async () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGTERM');
    }
    await exited;
  };
  t.after(stop);
  let output = '';
  const base = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Backend did not start within 10 seconds'));
    }, 10000);
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', () => {
      clearTimeout(timeout);
      reject(new Error('Backend exited before listening'));
    });
    child.stderr.resume();
    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
      const match = output.match(/Server running on port (\d+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(`http://127.0.0.1:${match[1]}`);
      }
    });
  });
  return { base, stop };
}

test(
  'SQL startup and restart preserve accounts without creating a JSON file',
  sqlTestOptions,
  async (t) => {
    const database = await createTestDatabase(t);
    const snapshotPath = path.join(
      tmpdir(),
      `unused-employee-${randomUUID()}.json`,
    );
    assert.equal(existsSync(snapshotPath), false);
    const first = await launch(t, database.url, snapshotPath);
    assert.equal((await fetch(`${first.base}/health`)).status, 200);

    const credentials = {
      first_name: 'Startup',
      last_name: 'Example',
      email: 'startup@example.test',
      password: 'startup-test-password',
    };
    const firstRequest = createTestRequest(
      first.base,
      database.prisma,
      testSessionOptions(),
    );
    const response = await firstRequest('/sign-up', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: credentials,
    });
    assert.equal(response.status, 200);
    const account = response.body;
    assert.equal(existsSync(snapshotPath), false);
    await first.stop();

    const second = await launch(t, database.url, snapshotPath);
    const secondRequest = createTestRequest(
      second.base,
      database.prisma,
      testSessionOptions(),
    );
    const resumed = await secondRequest('/me', {
      headers: { cookie: response.headers.getSetCookie()[0].split(';')[0] },
    });
    assert.equal(resumed.status, 200);
    assert.equal(resumed.body.userId, account.userId);
    const login = await secondRequest('/sign-in', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: credentials,
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.userId, account.userId);
    const detail = await secondRequest(`/users/${account.userId}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.email, credentials.email);
    assert.equal(existsSync(snapshotPath), false);
    await second.stop();
  },
);
