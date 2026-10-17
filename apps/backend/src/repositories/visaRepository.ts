// Visa reads for one employee or a batch of employee IDs.

import type { Pool } from 'pg';
import type { IVisa } from '../employeeTypes.js';

function toMilliseconds(value: string | number): number {
  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error('Invalid visa timestamp');
  }

  return number;
}

export function createVisaRepository(pool: Pool) {
  async function listByEmployeeId(id: string): Promise<IVisa[]> {
    const result = await pool.query<IVisa>(
      `SELECT
     issuing_country,
     type,
     start_date_ms AS start_date,
     end_date_ms AS end_date
   FROM visas
   WHERE employee_id = $1
   ORDER BY source_position`,
      [id],
    );

    return result.rows.map((row) => ({
      ...row,
      start_date: toMilliseconds(row.start_date),
      end_date: toMilliseconds(row.end_date),
    }));
  }

  return { listByEmployeeId };
}
