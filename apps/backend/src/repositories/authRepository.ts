import type { Pool } from 'pg';
import type { QueryExecutor } from './queryExecutor.js';
export type AuthRow = {
  employee_id: string;
  email: string;
  hashed_password: string;
  must_change_password: boolean;
};

export function createAuthRepository(pool: Pool) {
  async function findByEmail(email: string, executor: QueryExecutor = pool) {
    const result = await executor.query(
      `SELECT employee_id, email, hashed_password, must_change_password
        FROM auth_users
        WHERE email = $1
        `,
      [email],
    );
    return result.rows[0] ?? null;
  }

  // we can pass a transaction client.
  // without that, it will use default pool and the auth
  // insert could escape the account transaction
  async function insertAuthUser(row: AuthRow, executor: QueryExecutor = pool) {
    const result = await executor.query(
      `INSERT INTO auth_users
            (employee_id, email, hashed_password, must_change_password)
        VALUES($1, $2, $3, $4)
        `,
      [
        row.employee_id,
        row.email,
        row.hashed_password,
        row.must_change_password,
      ],
    );

    return result.rows[0] ?? null;
  }

  async function replaceRequiredPassword(id: string, hash: string) {
    const result = await pool.query(
      `UPDATE auth_users
        SET hashed_password = $1,
        must_change_password = FALSE
        WHERE employee_id = $2 AND must_change_password = TRUE
        RETURNING employee_id`,
      [hash, id],
    );
    return result.rows.length === 1;
  }
  return { findByEmail, insertAuthUser, replaceRequiredPassword };
}
