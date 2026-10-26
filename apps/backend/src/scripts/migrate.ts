/**
 * This is a standalone Node.js script, separate from the Express web server.
 * Express handles HTTP requests; this script prepares the PostgreSQL database.
 * A migration is a SQL file that changes the database structure, such as adding a table.
 * This script runs numbered SQL files and remembers which ones completed successfully.
 * It creates or updates tables; copying existing lowdb data is a separate task.
 */

// Import Node's file helpers: readFile reads a file's contents; readdir lists a folder's entries.
// The /promises versions return promises: results that become available when the work finishes.
import { readFile, readdir } from 'node:fs/promises';
// Import helpers for building filesystem paths that work on Windows and other operating systems.
import path from 'node:path';
// Import a helper that converts a file URL (file:///...) into a normal filesystem path.
import { fileURLToPath } from 'node:url';
// Import dotenv, which loads settings from a .env file into process.env.
import dotenv from 'dotenv';
// Import our project's helper for creating a pool of reusable PostgreSQL connections.
// The .js extension is used because the compiled JavaScript will import postgres.js.
import { createPostgresPool } from '../postgres.js';

// Define the function that does the work. Defining it does not run it yet.
// async allows await inside it. await waits for a promise without blocking Node's event loop.
// Promise<void> is TypeScript: this function finishes asynchronously without returning a value.
async function main(): Promise<void> {
  // const stores a value we will not reassign. path.resolve builds an absolute path.
  const backendDir = path.resolve(
    // import.meta.url identifies THIS script; convert it to a path, then get its folder.
    path.dirname(fileURLToPath(import.meta.url)),
    // Go up two folders: from src/scripts (or dist/scripts) to apps/backend.
    '../..',
  ); // Finish path.resolve and store the resulting backend folder path in backendDir.
  // Go up two more folders to the project's root .env and load its settings.
  // quiet: true hides dotenv's normal startup messages; existing environment values take priority.
  dotenv.config({ path: path.resolve(backendDir, '../../.env'), quiet: true });
  // process.env holds environment settings. ! means "missing or empty" here.
  // Throwing an Error stops this function if the database connection URL was not supplied.
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  // Build the path to apps/backend/sql/schema, where the migration SQL files live.
  const directory = path.join(backendDir, 'sql/schema');
  // Wait for the folder's entry names. Parentheses let us call array methods on the result.
  const files = (await readdir(directory))
    // Keep names matching this regular expression: ^ = start, \d+ = one or more digits,
    // .* = any following characters, \.sql = literal ".sql", $ = end of the name.
    // (name) => ... is an arrow function; .test(name) returns true when the name matches.
    .filter((name) => /^\d+.*\.sql$/.test(name))
    // Sort names as text. Zero-padded numbers put 001 before 002; unpadded 10 sorts before 2.
    .sort();
  // Create the connection pool using DATABASE_URL. A pool lets us borrow database connections.
  const pool = createPostgresPool();
  // Start a try/finally block so we close this pool even if database work fails.
  try {
    // Send SQL to PostgreSQL and wait for it to finish. Backticks allow a multiline string.
    // CREATE TABLE IF NOT EXISTS creates our tracking table only when it does not already exist.
    // filename TEXT PRIMARY KEY stores a unique, non-null filename for each completed migration.
    // applied_at stores a timezone-aware timestamp; NOT NULL requires a value,
    // and DEFAULT NOW() supplies the current transaction's start time when no value is given.
    // The final ) closes the SQL table definition; the backtick ends the JavaScript string.
    await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    // Work through the sorted filenames one at a time; filename is the current name.
    for (const filename of files) {
      // Ask the database whether we have already recorded this migration as completed.
      const applied = await pool.query(
        // $1 is a placeholder for the first value supplied separately in the next argument.
        // This keeps the value separate from SQL syntax instead of joining it into the SQL text.
        'SELECT filename FROM schema_migrations WHERE filename = $1',
        // Supply the current filename as the value for $1.
        [filename],
      ); // Finish the query and store its result (including returned rows) in applied.
      // A nonzero row count means it already ran. continue skips to the next filename.
      if (applied.rows.length) continue;
      // Read this SQL file. utf8 gives us its contents as text instead of raw bytes.
      const sql = await readFile(path.join(directory, filename), 'utf8');
      // Borrow one connection. All statements in a transaction must use that same connection.
      const client = await pool.connect();
      // This inner try handles one migration and ensures its borrowed connection is released.
      try {
        // Start a transaction: group the following database changes into one unit.
        await client.query('BEGIN');
        // Execute the SQL text we just read from the migration file.
        await client.query(sql);
        // Record this migration inside the SAME transaction as its database changes.
        await client.query(
          // Insert its filename; applied_at gets its default timestamp automatically.
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          // Again, provide the filename separately as the value for $1.
          [filename],
        ); // Finish the INSERT query and wait for it to complete.
        // Save both the migration changes and its tracking row permanently.
        await client.query('COMMIT');
        // Print progress to the terminal. ${filename} inserts the actual filename into the text.
        console.log(`Applied ${filename}`);
      } catch (error) {
        // If something in this inner try fails, handle the error here.
        // Undo this transaction's uncommitted changes, including any tracking row.
        // If rollback itself fails, .catch(() => undefined) ignores that second error
        // so we can report the original migration failure on the next line.
        await client.query('ROLLBACK').catch(() => undefined);
        // Pass the original error outward; stop processing further migration files.
        throw error;
      } finally {
        // Run this cleanup whether the migration succeeded or failed.
        // Return the borrowed connection to the pool so it can be used again.
        client.release();
      } // End the cleanup for this migration's connection.
    } // End the loop after all files are processed (or an error stops it).
  } finally {
    // Run this cleanup even when a query, file read, or connection attempt fails.
    // Close the pool's connections so this standalone script can finish and exit.
    await pool.end();
  } // End the pool cleanup.
} // End the main function definition.

// Actually run main. If its promise rejects, .catch runs this error-handling function.
// unknown is TypeScript: we must check what was thrown before treating it as an Error.
main().catch((error: unknown) => {
  // Print the Error's message, or a fallback if something other than an Error was thrown.
  // condition ? valueIfTrue : valueIfFalse is JavaScript's conditional (ternary) operator.
  console.error(error instanceof Error ? error.message : 'Migration failed');
  // Set the exit status to 1 (failure) for the terminal or CI, allowing Node to finish naturally.
  process.exitCode = 1;
}); // End the error handler attached to main().
