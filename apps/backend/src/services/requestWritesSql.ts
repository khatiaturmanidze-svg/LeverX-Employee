import { v4 as uuidv4 } from 'uuid';
import type { Pool } from 'pg';
import type { IRequestData } from '../employeeTypes.js';
import { ServiceError } from './serviceError.js';

const projection = `id, type,
  to_char(start_date, 'YYYY-MM-DD') AS start_date,
  to_char(end_date, 'YYYY-MM-DD') AS end_date,
  note, status, employee_id AS "employeeId"`;

async function requireEmployee(pool: Pool, id: string) {
  const found = await pool.query('SELECT id FROM employees WHERE id = $1', [
    id,
  ]);
  if (!found.rows.length)
    throw new ServiceError(401, { error: 'employee not found' });
}

export async function createRequestSql(
  pool: Pool,
  employeeId: string,
  input: Pick<IRequestData, 'type' | 'start_date' | 'end_date' | 'note'>,
): Promise<IRequestData> {
  await requireEmployee(pool, employeeId);
  const result = await pool.query<IRequestData>(
    `INSERT INTO requests
      (id, employee_id, type, start_date, end_date, note, status, source_position)
     VALUES ($1,$2,$3,$4,$5,$6,'pending',
       (SELECT COALESCE(MIN(source_position), 0) - 1
        FROM requests WHERE employee_id = $2))
     RETURNING ${projection}`,
    [
      uuidv4(),
      employeeId,
      input.type,
      input.start_date,
      input.end_date,
      input.note,
    ],
  );
  return result.rows[0];
}

export async function updateRequestSql(
  pool: Pool,
  employeeId: string,
  requestId: string | number,
  status: IRequestData['status'],
): Promise<IRequestData> {
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ServiceError(400, { error: 'invalid request status' });
  }
  const employee = await pool.query('SELECT id FROM employees WHERE id = $1', [
    employeeId,
  ]);
  if (!employee.rows.length)
    throw new ServiceError(404, { message: 'Employee not found' });
  const result = await pool.query<IRequestData>(
    `UPDATE requests SET status = $1 WHERE id = $2 AND employee_id = $3
     RETURNING ${projection}`,
    [status, String(requestId), employeeId],
  );
  if (!result.rows.length)
    throw new ServiceError(404, { message: 'Request not found' });
  return result.rows[0];
}
