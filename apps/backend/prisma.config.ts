import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(backendDir, '../../.env'), quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node dist/scripts/seedAdmin.js',
  },
  datasource: process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : undefined,
});
