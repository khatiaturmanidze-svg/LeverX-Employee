import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { createPrismaClient } from './prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = createPrismaClient();

try {
  await prisma.$connect();
} catch (error) {
  await prisma.$disconnect();
  throw error;
}

const app = createApp(prisma, {
  frontendPort: Number(process.env.VITE_FE_PORT || 5173),
  token: process.env.VITE_AUTH_TOKEN || 'authorized-can-access',
  staticDirectory: path.join(__dirname, '../dist'),
});
const PORT = Number(process.env.PORT || process.env.VITE_API_PORT || 3000);

const server = app.listen(PORT, () => {
  const address = server.address();
  const port = address && typeof address === 'object' ? address.port : PORT;
  console.log(`Server running on port ${port}`);
});

let stopping = false;
const stop = () => {
  if (stopping) return;
  stopping = true;
  server.close((error) => {
    if (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
    void prisma.$disconnect().catch((error: unknown) => {
      console.error(
        error instanceof Error ? error.message : 'Database shutdown failed',
      );
      process.exitCode = 1;
    });
  });
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
server.once('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
  void prisma.$disconnect().catch(() => undefined);
});
