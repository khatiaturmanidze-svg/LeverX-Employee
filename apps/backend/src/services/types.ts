// Only the deferred, unmounted visa exercise uses this legacy JSON type.
import type { initDatabase } from '../database.js';
export type LegacyJsonDatabase = Awaited<ReturnType<typeof initDatabase>>;
