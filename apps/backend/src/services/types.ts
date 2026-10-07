import type { initDatabase } from '../database.js';
export type Database = Awaited<ReturnType<typeof initDatabase>>;
