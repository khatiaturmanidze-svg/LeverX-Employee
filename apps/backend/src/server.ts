import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import { createApp } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const db = await initDatabase();
const app = createApp(db, {
  frontendPort: Number(process.env.VITE_FE_PORT || 5173),
  token: process.env.VITE_AUTH_TOKEN || 'authorized-can-access',
  staticDirectory: path.join(__dirname, '../dist'),
});
const PORT = Number(process.env.PORT || process.env.VITE_API_PORT || 3000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
