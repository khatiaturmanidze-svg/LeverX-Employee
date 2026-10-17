//Validate and import a lowDB snapshot without modifying the source JSON. Support a validation-only mode.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// finds the folder containing this script
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// go from backend/dist/scripts up to backend
const backendDir = path.resolve(scriptDir, '../../');

// go from backend up to the respository root
const projectDir = path.resolve(backendDir, '../../');

// load the root .env before reading its settings
const envPath = path.resolve(projectDir, '.env');
dotenv.config({ path: envPath });

// resolve DATABASE_PATH relative to backend
const jsonPath = path.resolve(
  backendDir,
  process.env.DATABASE_PATH || './src/db.json',
);

// const contents = await readFile(jsonPath, 'utf8');
// const source: unknown = JSON.parse(contents);

// locate the saved SQL files

const schemaDir = path.resolve(backendDir, 'sql', 'schema');
console.log({
  envPath,
  jsonPath,
  schemaDir,
});
