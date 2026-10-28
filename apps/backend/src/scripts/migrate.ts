import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

// Keep the old command working while Prisma owns the migration history.
const backendDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const cli = createRequire(import.meta.url).resolve('prisma');
const result = spawnSync(
  process.execPath,
  [
    cli,
    'migrate',
    'deploy',
    '--config',
    path.join(backendDir, 'prisma.config.ts'),
  ],
  { stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
