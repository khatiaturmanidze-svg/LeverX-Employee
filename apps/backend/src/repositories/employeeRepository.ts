/**
 * Employee detail/list queries,
 *  manager self-join and employee-existence query.
 */

import type { Pool } from 'pg';
import type { IManager, IVisa, IRequestData } from '../employeeTypes.js';
import type { EmployeeRow } from './types.js';
export function createEmployeeRepository(pool: Pool) {
  async function findIdentity(id: string) {
    const result = await pool.query<{
      id: string;
      first_name: string;
      email: string;
    }>('SELECT id, first_name, email FROM employees WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  }

  async function listAll() {
    const result = await pool.query<
      EmployeeRow & {
        manager: IManager | null;
        visas: IVisa[];
        requests: IRequestData[];
      }
    >(`
    SELECT
      e.*,

      CASE WHEN m.id IS NULL THEN NULL
        ELSE jsonb_build_object(
          'id', m.id,
          'first_name', m.first_name,
          'last_name', m.last_name
        )
      END AS manager,

      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'issuing_country', v.issuing_country,
              'type', v.type,
              'start_date', v.start_date_ms,
              'end_date', v.end_date_ms
            )
            ORDER BY v.source_position, v.id
          )
          FROM visas v
          WHERE v.employee_id = e.id
        ),
        '[]'::jsonb
      ) AS visas,

      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', r.id,
              'type', r.type,
              'start_date', to_char(r.start_date, 'YYYY-MM-DD'),
              'end_date', to_char(r.end_date, 'YYYY-MM-DD'),
              'note', r.note,
              'status', r.status,
              'employeeId', r.employee_id
            )
            ORDER BY r.source_position, r.id
          )
          FROM requests r
          WHERE r.employee_id = e.id
        ),
        '[]'::jsonb
      ) AS requests

    FROM employees e
    LEFT JOIN employees m ON m.id = e.manager_id
    ORDER BY e.source_position, e.id
  `);

    return result.rows;
  }

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
  return { findIdentity, findById, findManager, listAll };
}
