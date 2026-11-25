import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { createTestDatabase } from '../tests/helpers/postgres.js';
import { createSessionStore } from '../dist/sessionStore.js';
import { createApp } from '../dist/app.js';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
dotenv.config({ path: path.join(root, '.env.test'), quiet: true });
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.SYNTHETIC_LATENCY_MIN = '';
process.env.SYNTHETIC_LATENCY_MAX = '';
const after = [];
let server;
let store;
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (server)
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  store?.close();
  for (const cleanup of after.reverse()) await cleanup();
  process.stdin.pause();
}
try {
  const database = await createTestDatabase({ after: (fn) => after.push(fn) });
  const password = 'Disposable-browser-password-2026!';
  for (const [id, role, temporary] of [
    ['browser-admin', 'Admin', false],
    ['browser-temporary', 'Employee', true],
  ]) {
    await database.prisma.employee.create({
      data: {
        id,
        firstName: temporary ? 'Temporary' : 'Browser',
        lastName: 'Example',
        role,
        email: id + '@example.test',
        department: 'Test workspace',
        building: 'A',
        room: '1',
        authUser: {
          create: {
            email: id + '@example.test',
            hashedPassword: await bcrypt.hash(password, 4),
            mustChangePassword: temporary,
          },
        },
      },
    });
  }
  store = createSessionStore(database.pool, database.schema, false);
  const app = express();
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = 'http://session-check.localhost:' + server.address().port;
  const assets = path.join(root, 'apps/frontend/dist');
  app.use(
    '/api',
    createApp(database.prisma, {
      frontendPort: server.address().port,
      staticDirectory: assets,
      appOrigin: origin,
      allowPublicSignup: false,
      audit: () => {},
      session: {
        store,
        secret: randomBytes(32).toString('hex'),
        production: false,
      },
    }),
  );
  app.use(express.static(assets));
  app.use((_req, res) => res.sendFile(path.join(assets, 'index.html')));
  console.log(origin + '/signin');
  console.log(
    'Disposable accounts: browser-admin@example.test / browser-temporary@example.test',
  );
  console.log('Disposable test password: ' + password);
  process.once('SIGINT', () => {
    void stop();
  });
  process.once('SIGTERM', () => {
    void stop();
  });
  process.stdin.resume();
  process.stdin.on('data', (data) => {
    if (data.toString().includes('stop')) {
      void stop().then(() => process.stdin.pause());
    }
  });
} catch (error) {
  await stop();
  console.error(
    error instanceof Error ? error.message : 'Browser preview failed',
  );
  process.exitCode = 1;
}
