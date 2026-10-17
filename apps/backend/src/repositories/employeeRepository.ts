/**
 * Employee detail/list queries,
 *  manager self-join and employee-existence query.
 */

import type { Pool } from 'pg';
import type { IManager } from '../employeeTypes.js';
import type { EmployeeRow } from './types.js';
export function createEmployeeRepository(pool: Pool) {
  async function findById(id: string): Promise<EmployeeRow | null> {
    const result = await pool.query<EmployeeRow>(
      ` SELECT
         id, first_name, last_name, email, role, user_avatar,
         first_native_name, middle_native_name, last_native_name,
         department, building, room, desk_number, is_remote_work,
         phone, zoom_id, zoom_link, citizenship,
         birth_year, birth_month, birth_day, manager_id, source_position
         FROM employees
         WHERE id = $1`,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async function findManager(id: string): Promise<IManager | null> {
    const result = await pool.query<IManager>(
      'SELECT id, first_name, last_name FROM employees WHERE id = $1',
      [id],
    );

    const manager = result.rows[0];

    if (manager === undefined || manager === null) return null;

    return manager;
  }
  return { findById, findManager };
}
