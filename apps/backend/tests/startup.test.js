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
        VITE_AUTH_TOKEN: 'startup-test-token',
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
    const response = await fetch(`${first.base}/sign-up`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    assert.equal(response.status, 200);
    const account = await response.json();
    assert.equal(existsSync(snapshotPath), false);
    await first.stop();

    const second = await launch(t, database.url, snapshotPath);
    const login = await fetch(`${second.base}/sign-in`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    assert.equal(login.status, 200);
    assert.equal((await login.json()).userId, account.userId);
    const detail = await fetch(`${second.base}/users/${account.userId}`, {
      headers: { authorization: 'startup-test-token' },
    });
    assert.equal(detail.status, 200);
    assert.equal((await detail.json()).email, credentials.email);
    assert.equal(existsSync(snapshotPath), false);
    await second.stop();
  },
);
