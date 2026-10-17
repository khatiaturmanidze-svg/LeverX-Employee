import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import { createApp } from './app.js';
import { createPostgresPool } from './postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const postgresPool = createPostgresPool();

const result = await postgresPool.query(
  'SELECT * FROM employees WHERE id = $1',
  ['practice-1'],
);

console.log('Employee from postgresPool:', result.rows[0]);

const db = await initDatabase();
const app = createApp(
  db,
  {
    frontendPort: Number(process.env.VITE_FE_PORT || 5173),
    token: process.env.VITE_AUTH_TOKEN || 'authorized-can-access',
    staticDirectory: path.join(__dirname, '../dist'),
  },
  postgresPool,
);
const PORT = Number(process.env.PORT || process.env.VITE_API_PORT || 3000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
