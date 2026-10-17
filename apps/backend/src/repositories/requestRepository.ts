// Request reads for one employee or a batch of employee IDs.
import type { Pool } from 'pg';
import type { IRequestData } from '../employeeTypes.js';

export function createRequestRepository(pool: Pool) {
  async function listByEmployeeId(id: string): Promise<IRequestData[]> {
    const result = await pool.query<IRequestData>(
      `SELECT id, type, to_char(start_date, 'YYYY-MM-DD') AS start_date, 
            to_char(end_date, 'YYYY-MM-DD') AS end_date, note, status, employee_id AS "employeeId"
                FROM requests
                WHERE employee_id = $1
                ORDER BY source_position`,
      [id],
    );

    // const requests = result.rows;

    // if (requests.length === 0) return
    return result.rows;
  }

  return { listByEmployeeId };
}
