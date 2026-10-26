import type { Pool } from 'pg';
import type { IEmployee } from '../employeeTypes.js';
import { withTransaction } from '../transactions.js';
import { isEmailConflict } from './accountCreation.js';
import { ServiceError } from './serviceError.js';

export type ProfilePatch = Partial<
  Omit<IEmployee, '_id' | 'manager' | 'role' | 'requests'>
> & { manager?: string | null };

const columns: Record<string, string> = {
  first_name: 'first_name',
  last_name: 'last_name',
  user_avatar: 'user_avatar',
  first_native_name: 'first_native_name',
  middle_native_name: 'middle_native_name',
  last_native_name: 'last_native_name',
  department: 'department',
  building: 'building',
  room: 'room',
  desk_number: 'desk_number',
  isRemoteWork: 'is_remote_work',
  phone: 'phone',
  email: 'email',
  zoom_id: 'zoom_id',
  zoom_link: 'zoom_link',
  citizenship: 'citizenship',
};

export async function updateEmployeeSql(
  pool: Pool,
  id: string,
  patch: ProfilePatch,
  readEmployee: (id: string) => Promise<IEmployee>,
) {
  const allowed = new Set([
    ...Object.keys(columns),
    'manager',
    'date_birth',
    'visa',
  ]);
  if (Object.keys(patch).some((key) => !allowed.has(key))) {
    throw new ServiceError(400, { error: 'unsupported employee field' });
  }
  const normalized = { ...patch, email: patch.email?.trim().toLowerCase() };
  if (patch.email !== undefined && !normalized.email) {
    throw new ServiceError(400, { error: 'email is required' });
  }
  try {
    await withTransaction(pool, async (client) => {
      const found = await client.query(
        'SELECT id FROM employees WHERE id = $1 FOR UPDATE',
        [id],
      );
      if (!found.rows.length)
        throw new ServiceError(404, { error: 'employee not found' });
      const assignments: string[] = [];
      const values: unknown[] = [];
      const add = (column: string, value: unknown) => {
        values.push(value);
        assignments.push(`${column} = $${values.length}`);
      };
      for (const [key, column] of Object.entries(columns)) {
        const value = normalized[key as keyof typeof normalized];
        if (value !== undefined) add(column, value);
      }
      if (patch.manager !== undefined) add('manager_id', patch.manager || null);
      if (patch.date_birth !== undefined) {
        add('birth_year', patch.date_birth?.year ?? null);
        add('birth_month', patch.date_birth?.month ?? null);
        add('birth_day', patch.date_birth?.day ?? null);
      }
      if (assignments.length) {
        values.push(id);
        await client.query(
          `UPDATE employees SET ${assignments.join(', ')} WHERE id = $${values.length}`,
          values,
        );
      }
      if (normalized.email !== undefined) {
        await client.query(
          'UPDATE auth_users SET email = $1 WHERE employee_id = $2',
          [normalized.email, id],
        );
      }
      if (patch.visa !== undefined) {
        await client.query('DELETE FROM visas WHERE employee_id = $1', [id]);
        for (const [position, visa] of patch.visa.entries()) {
          await client.query(
            `INSERT INTO visas
              (employee_id, issuing_country, type, start_date_ms, end_date_ms, source_position)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [
              id,
              visa.issuing_country,
              visa.type,
              visa.start_date,
              visa.end_date,
              position,
            ],
          );
        }
      }
    });
  } catch (error) {
    if (isEmailConflict(error))
      throw new ServiceError(400, { error: 'email already exists' });
    throw error;
  }
  return {
    message: 'employee updated successfully',
    employee: await readEmployee(id),
  };
}
