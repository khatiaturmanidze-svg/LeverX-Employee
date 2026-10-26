import type { Pool } from 'pg';
import type { IEmployee, IManager } from '../employeeTypes.js';
import type { EmployeeRow } from '../repositories/types.js';
import { createAuthRepository } from '../repositories/authRepository.js';
import { toEmployeeResponse } from '../mappers/employeeMapper.js';
import { withTransaction } from '../transactions.js';
import { ServiceError } from './serviceError.js';

type ProfileInput = Pick<IEmployee, 'first_name' | 'last_name' | 'email'> &
  Partial<IEmployee>;

export function makeProfile(input: ProfileInput, id: string): IEmployee {
  if (
    !input.first_name?.trim() ||
    !input.last_name?.trim() ||
    !input.email?.trim()
  ) {
    throw new ServiceError(400, { error: 'name and email are required' });
  }
  return {
    _id: id,
    email: input.email.trim().toLowerCase(),
    first_name: input.first_name,
    last_name: input.last_name,
    role: input.role ?? 'Employee',
    user_avatar: input.user_avatar ?? '/users/dumplinh.jpg',
    first_native_name: input.first_native_name ?? '',
    middle_native_name: input.middle_native_name ?? '',
    last_native_name: input.last_native_name ?? '',
    department: input.department ?? '',
    building: input.building ?? '',
    room: input.room ?? '0',
    desk_number: input.desk_number ?? null,
    isRemoteWork: input.isRemoteWork ?? false,
    phone: input.phone ?? '',
    zoom_id: input.zoom_id ?? '',
    zoom_link: input.zoom_link ?? '',
    citizenship: input.citizenship ?? '',
    date_birth: input.date_birth ?? { year: null, month: null, day: null },
    manager: input.manager ?? { id: '', first_name: '', last_name: '' },
    visa: input.visa ?? [],
    requests: [],
  };
}

export function isEmailConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: string; constraint?: string };
  return (
    value.code === '23505' &&
    new Set([
      'employees_email_key',
      'auth_users_email_key',
      'employees_email_normalized_key',
      'auth_users_email_normalized_key',
    ]).has(value.constraint ?? '')
  );
}

export async function createAccount(
  pool: Pool,
  profile: IEmployee,
  hash: string,
  mustChangePassword: boolean,
): Promise<IEmployee> {
  const auth = createAuthRepository(pool);
  return withTransaction(pool, async (client) => {
    const result = await client.query<EmployeeRow>(
      `INSERT INTO employees (
        id, role, first_name, last_name, email, user_avatar,
        first_native_name, middle_native_name, last_native_name,
        department, building, room, desk_number, is_remote_work,
        phone, zoom_id, zoom_link, citizenship,
        birth_year, birth_month, birth_day, manager_id, source_position
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
        $15,$16,$17,$18,$19,$20,$21,$22,
        (SELECT COALESCE(MAX(source_position), -1) + 1 FROM employees)
      ) RETURNING *`,
      [
        profile._id,
        profile.role,
        profile.first_name,
        profile.last_name,
        profile.email,
        profile.user_avatar,
        profile.first_native_name,
        profile.middle_native_name,
        profile.last_native_name,
        profile.department,
        profile.building,
        profile.room,
        profile.desk_number,
        profile.isRemoteWork,
        profile.phone,
        profile.zoom_id,
        profile.zoom_link,
        profile.citizenship,
        profile.date_birth?.year ?? null,
        profile.date_birth?.month ?? null,
        profile.date_birth?.day ?? null,
        profile.manager?.id || null,
      ],
    );
    await auth.insertAuthUser(
      {
        employee_id: profile._id,
        email: profile.email,
        hashed_password: hash,
        must_change_password: mustChangePassword,
      },
      client,
    );
    for (const [position, visa] of (profile.visa ?? []).entries()) {
      await client.query(
        `INSERT INTO visas
          (employee_id, issuing_country, type, start_date_ms, end_date_ms, source_position)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          profile._id,
          visa.issuing_country,
          visa.type,
          visa.start_date,
          visa.end_date,
          position,
        ],
      );
    }
    let manager: IManager | null = null;
    if (profile.manager?.id) {
      const found = await client.query<IManager>(
        'SELECT id, first_name, last_name FROM employees WHERE id = $1',
        [profile.manager.id],
      );
      manager = found.rows[0] ?? null;
    }
    return toEmployeeResponse(result.rows[0], manager, profile.visa ?? [], []);
  });
}
