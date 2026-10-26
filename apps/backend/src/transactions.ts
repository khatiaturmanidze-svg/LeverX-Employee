import type { Pool, PoolClient } from 'pg';

export async function withTransaction<T>(
  pool: Pool,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    // catch(()=>undefined) on rollback preserves the original error
    // if cleanup itself fails
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    // returns one borrowed client, does not close the whole pool
    client.release();
  }
}

/**
 * // Excerpt inside a function that already receives pool.
const account = await withTransaction(pool, async (client) => {
  // Insert employee with client.query(...).
  // Insert credentials with client.query(...).
  // Read/map response with that client if needed.
  return employeeResponse;
});

 */
