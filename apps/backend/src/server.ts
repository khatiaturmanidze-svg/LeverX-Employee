import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import dotenv from 'dotenv';
import pg from 'pg';
import type { Server } from 'node:http';
import { createSessionStore } from './sessionStore.js';
import { createApp } from './app.js';
import { createPrismaClient } from './prisma.js';
import { loadEnvironment } from './config/environment.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(directory, '../../../.env'), quiet: true });
const config = loadEnvironment(process.env);
const prisma = createPrismaClient(config.databaseUrl);
const sessionPool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 5,
  connectionTimeoutMillis: 5000,
});
const sessionStore = createSessionStore(sessionPool, config.schema);
let server: Server | undefined;
let cleanup: Promise<void> | undefined;

function closeResources() {
  cleanup ??= (async () => {
    sessionStore.close();
    const outcomes = await Promise.allSettled([
      sessionPool.end(),
      prisma.$disconnect(),
    ]);
    if (outcomes.some((outcome) => outcome.status === 'rejected')) {
      console.error({ event: 'database_shutdown_failed' });
      process.exitCode = 1;
    }
  })();
  return cleanup;
}

try {
  await prisma.$connect();
  // Do not start an API instance with a missing or inaccessible session table.
  await sessionPool.query(
    'SELECT 1 FROM "' + config.schema + '"."web_sessions" LIMIT 0',
  );
  await prisma.authRateLimit.count();
  const app = createApp(prisma, {
    frontendPort: config.frontendPort,
    staticDirectory: path.resolve(directory, '../../frontend/dist'),
    appOrigin: config.appOrigin,
    trustProxy: config.trustProxy,
    allowPublicSignup: config.allowPublicSignup,
    session: {
      store: sessionStore,
      secret: config.secret,
      production: config.production,
    },
  });
  server = app.listen(config.port);
  await once(server, 'listening');
  const address = server.address();
  console.log(
    'Server running on port ' +
      (address && typeof address === 'object' ? address.port : config.port),
  );
} catch {
  console.error({
    event: 'backend_startup_failed',
    message:
      'Check database access, session migrations, and application configuration.',
  });
  await closeResources();
  process.exitCode = 1;
}

let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (server?.listening) {
    const closing = new Promise<void>((resolve) =>
      server!.close(() => resolve()),
    );
    server.closeIdleConnections();
    const deadline = setTimeout(() => server?.closeAllConnections(), 10000);
    deadline.unref();
    await closing;
    clearTimeout(deadline);
  }
  await closeResources();
}
process.once('SIGINT', () => {
  void stop();
});
process.once('SIGTERM', () => {
  void stop();
});
server?.on('error', () => {
  console.error({ event: 'http_server_failed' });
  process.exitCode = 1;
  void stop();
});
