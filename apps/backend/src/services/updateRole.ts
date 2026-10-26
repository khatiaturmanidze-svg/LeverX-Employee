import type { Pool } from 'pg';
import type { IEmployee } from '../employeeTypes.js';
import { ServiceError } from './serviceError.js';

export async function updateRoleSql(
  pool: Pool,
  id: string,
  newRole: string,
  readEmployee: (id: string) => Promise<IEmployee>,
) {
  const result = await pool.query(
    'UPDATE employees SET role = $1 WHERE id = $2 RETURNING id',
    [newRole, id],
  );
  if (!result.rows.length)
    throw new ServiceError(404, { error: 'Employee not found.' });
  return {
    message: 'Role updated successfully',
    employee: await readEmployee(id),
  };
}
