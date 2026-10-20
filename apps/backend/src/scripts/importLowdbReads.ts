// Import employee read data into existing SQL tables. Never modify the JSON.
// Auth records remain in lowDB; this script imports employees, visas and requests.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import type { Pool } from 'pg';
import type { IEmployee, IRequestData, IVisa } from '../employeeTypes.js';
import { createPostgresPool } from '../postgres.js';

type ImportEmployee = IEmployee & { visa: IVisa[]; requests: IRequestData[] };

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, fallback = ''): string {
  if (value == null) return fallback;
  if (typeof value !== 'string') throw new Error(`${label} must be text`);
  return value;
}

function identifier(value: unknown, label: string): string {
  const result =
    typeof value === 'number' && Number.isSafeInteger(value)
      ? String(value)
      : text(value, label);
  if (!result.trim()) throw new Error(`${label} is required`);
  return result;
}

function integer(value: unknown, label: string): number | null {
  if (value == null || value === '') return null;
  const result =
    typeof value === 'string' && /^-?\d+$/.test(value) ? Number(value) : value;
  if (
    typeof result !== 'number' ||
    !Number.isInteger(result) ||
    result < -2147483648 ||
    result > 2147483647
  )
    throw new Error(`${label} must be a PostgreSQL integer or null`);
  return result;
}

function array(value: unknown, label: string): unknown[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
}

function date(value: unknown, label: string): string {
  const result = text(value, label);
  const parsed = new Date(`${result}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(result) ||
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== result
  )
    throw new Error(`${label} must be a valid YYYY-MM-DD date`);
  return result;
}

function milliseconds(value: unknown, label: string): number {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && !/^-?\d+$/.test(value))
  )
    throw new Error(`${label} must contain integer milliseconds`);
  const result = Number(value);
  if (!Number.isSafeInteger(result))
    throw new Error(`${label} is outside the safe integer range`);
  return result;
}

// Validate unknown JSON before opening a database connection.
export function validateSnapshot(source: unknown): ImportEmployee[] {
  const snapshot = object(source, 'Snapshot');
  if (!Array.isArray(snapshot.employees))
    throw new Error('Snapshot.employees must be an array');
  const ids = new Set<string>();
  const emails = new Set<string>();
  const requestIds = new Set<string>();
  const employees = snapshot.employees.map(
    (value, position): ImportEmployee => {
      const label = `employees[${position}]`;
      const row = object(value, label);
      const id = identifier(row._id, `${label}._id`);
      const email = identifier(row.email, `${label}.email`);
      if (ids.has(id)) throw new Error(`${label} has a duplicate employee ID`);
      if (emails.has(email.trim().toLowerCase()))
        throw new Error(`${label} has a duplicate email`);
      ids.add(id);
      emails.add(email.trim().toLowerCase());
      const birth =
        row.date_birth == null
          ? {}
          : object(row.date_birth, `${label}.date_birth`);
      const manager =
        row.manager == null ? {} : object(row.manager, `${label}.manager`);
      if (row.isRemoteWork != null && typeof row.isRemoteWork !== 'boolean')
        throw new Error(`${label}.isRemoteWork must be boolean`);

      const visas = array(row.visa, `${label}.visa`).map(
        (value, index): IVisa => {
          const itemLabel = `${label}.visa[${index}]`;
          const visa = object(value, itemLabel);
          return {
            issuing_country: text(
              visa.issuing_country,
              `${itemLabel}.issuing_country`,
            ),
            type: text(visa.type, `${itemLabel}.type`),
            start_date: milliseconds(
              visa.start_date,
              `${itemLabel}.start_date`,
            ),
            end_date: milliseconds(visa.end_date, `${itemLabel}.end_date`),
          };
        },
      );

      const requests = array(row.requests, `${label}.requests`).map(
        (value, index): IRequestData => {
          const itemLabel = `${label}.requests[${index}]`;
          const request = object(value, itemLabel);
          const requestId = identifier(request.id, `${itemLabel}.id`);
          if (requestIds.has(requestId))
            throw new Error(`${itemLabel} has a duplicate request ID`);
          requestIds.add(requestId);
          const status = request.status;
          if (
            status !== 'pending' &&
            status !== 'approved' &&
            status !== 'rejected'
          )
            throw new Error(`${itemLabel}.status is invalid`);
          if (request.employeeId != null && String(request.employeeId) !== id)
            throw new Error(
              `${itemLabel}.employeeId does not match its parent employee`,
            );
          return {
            id: requestId,
            employeeId: id,
            status,
            type: text(request.type, `${itemLabel}.type`),
            note: text(request.note, `${itemLabel}.note`),
            start_date: date(request.start_date, `${itemLabel}.start_date`),
            end_date: date(request.end_date, `${itemLabel}.end_date`),
          };
        },
      );

      return {
        _id: id,
        email,
        first_name: text(row.first_name, `${label}.first_name`),
        last_name: text(row.last_name, `${label}.last_name`),
        role: text(row.role, `${label}.role`, 'Employee'),
        user_avatar: text(
          row.user_avatar,
          `${label}.user_avatar`,
          '/users/dumplinh.jpg',
        ),
        first_native_name: text(
          row.first_native_name,
          `${label}.first_native_name`,
        ),
        middle_native_name: text(
          row.middle_native_name,
          `${label}.middle_native_name`,
        ),
        last_native_name: text(
          row.last_native_name,
          `${label}.last_native_name`,
        ),
        department: text(row.department, `${label}.department`),
        building: text(row.building, `${label}.building`),
        room: text(row.room, `${label}.room`, '0'),
        desk_number: integer(row.desk_number, `${label}.desk_number`),
        isRemoteWork: row.isRemoteWork === true,
        phone: text(row.phone, `${label}.phone`),
        zoom_id: text(row.zoom_id, `${label}.zoom_id`),
        zoom_link: text(row.zoom_link, `${label}.zoom_link`),
        citizenship: text(row.citizenship, `${label}.citizenship`),
        date_birth: {
          year: integer(birth.year, `${label}.date_birth.year`),
          month: integer(birth.month, `${label}.date_birth.month`),
          day: integer(birth.day, `${label}.date_birth.day`),
        },
        manager: {
          id:
            manager.id == null || manager.id === ''
              ? ''
              : identifier(manager.id, `${label}.manager.id`),
          first_name: text(manager.first_name, `${label}.manager.first_name`),
          last_name: text(manager.last_name, `${label}.manager.last_name`),
        },
        visa: visas,
        requests,
      };
    },
  );
  for (const employee of employees) {
    if (employee.manager?.id && !ids.has(employee.manager.id))
      throw new Error(
        `Employee ${employee._id} references a manager outside the snapshot`,
      );
  }
  return employees;
}

export async function importSnapshot(
  pool: Pick<Pool, 'connect'>,
  employees: ImportEmployee[],
): Promise<void> {
  if (!employees.length) return;
  const client = await pool.connect();
  let began = false;
  try {
    await client.query('BEGIN');
    began = true;
    const ids = employees.map((employee) => employee._id);
    const emails = employees.map((employee) =>
      employee.email.trim().toLowerCase(),
    );

    // Stop if existing SQL records represent different employee identities.
    const existing = await client.query<{ id: string; email: string }>(
      'SELECT id, email FROM employees WHERE id = ANY($1::text[]) OR lower(trim(email)) = ANY($2::text[])',
      [ids, emails],
    );
    const sourceById = new Map(
      employees.map((employee) => [employee._id, employee]),
    );
    for (const row of existing.rows) {
      const source = sourceById.get(row.id);
      if (
        !source ||
        source.email.trim().toLowerCase() !== row.email.trim().toLowerCase()
      )
        throw new Error(
          `SQL employee ${row.id} conflicts with the snapshot identity`,
        );
    }

    // Insert every employee first; their managers may appear later in the JSON.
    for (const [position, employee] of employees.entries()) {
      await client.query(
        `
        INSERT INTO employees (
          id, first_name, last_name, email, role, user_avatar,
          first_native_name, middle_native_name, last_native_name,
          department, building, room, desk_number, is_remote_work,
          phone, zoom_id, zoom_link, citizenship,
          birth_year, birth_month, birth_day, manager_id, source_position
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NULL, $22
        )
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
          email = EXCLUDED.email, role = EXCLUDED.role, user_avatar = EXCLUDED.user_avatar,
          first_native_name = EXCLUDED.first_native_name, middle_native_name = EXCLUDED.middle_native_name,
          last_native_name = EXCLUDED.last_native_name, department = EXCLUDED.department,
          building = EXCLUDED.building, room = EXCLUDED.room, desk_number = EXCLUDED.desk_number,
          is_remote_work = EXCLUDED.is_remote_work, phone = EXCLUDED.phone,
          zoom_id = EXCLUDED.zoom_id, zoom_link = EXCLUDED.zoom_link, citizenship = EXCLUDED.citizenship,
          birth_year = EXCLUDED.birth_year, birth_month = EXCLUDED.birth_month, birth_day = EXCLUDED.birth_day,
          manager_id = NULL, source_position = EXCLUDED.source_position
      `,
        [
          employee._id,
          employee.first_name,
          employee.last_name,
          employee.email,
          employee.role,
          employee.user_avatar,
          employee.first_native_name,
          employee.middle_native_name,
          employee.last_native_name,
          employee.department,
          employee.building,
          employee.room,
          employee.desk_number,
          employee.isRemoteWork,
          employee.phone,
          employee.zoom_id,
          employee.zoom_link,
          employee.citizenship,
          employee.date_birth?.year,
          employee.date_birth?.month,
          employee.date_birth?.day,
          position,
        ],
      );
    }
    for (const employee of employees) {
      if (employee.manager?.id)
        await client.query(
          'UPDATE employees SET manager_id = $1 WHERE id = $2',
          [employee.manager.id, employee._id],
        );
    }

    // Replace related rows only for imported employees; reruns cannot duplicate them.
    await client.query(
      'DELETE FROM visas WHERE employee_id = ANY($1::text[])',
      [ids],
    );
    await client.query(
      'DELETE FROM requests WHERE employee_id = ANY($1::text[])',
      [ids],
    );
    for (const employee of employees) {
      for (const [position, visa] of employee.visa.entries()) {
        await client.query(
          `
          INSERT INTO visas (employee_id, issuing_country, type, start_date_ms, end_date_ms, source_position)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            employee._id,
            visa.issuing_country,
            visa.type,
            visa.start_date,
            visa.end_date,
            position,
          ],
        );
      }
      for (const [position, request] of employee.requests.entries()) {
        await client.query(
          `
          INSERT INTO requests (id, employee_id, type, start_date, end_date, note, status, source_position)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            request.id,
            employee._id,
            request.type,
            request.start_date,
            request.end_date,
            request.note,
            request.status,
            position,
          ],
        );
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    if (began) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* Preserve the original import error. */
      }
    }
    throw error;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !['--validate-only', '--import'].includes(args[0]))
    throw new Error(
      'Usage: node apps/backend/dist/scripts/importLowdbReads.js --validate-only | --import',
    );
  const backendDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..',
  );
  dotenv.config({ path: path.resolve(backendDir, '../../.env'), quiet: true });
  const jsonPath = path.resolve(
    backendDir,
    process.env.DATABASE_PATH || './src/db.json',
  );
  const source: unknown = JSON.parse(await readFile(jsonPath, 'utf8'));
  const employees = validateSnapshot(source);
  const counts = {
    employees: employees.length,
    visas: employees.reduce(
      (count, employee) => count + employee.visa.length,
      0,
    ),
    requests: employees.reduce(
      (count, employee) => count + employee.requests.length,
      0,
    ),
  };
  console.log('Validated snapshot:', counts);
  if (args[0] === '--validate-only') {
    console.log('Validation finished. PostgreSQL was not contacted.');
    return;
  }
  if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is required for --import');
  const pool = createPostgresPool();
  try {
    await importSnapshot(pool, employees);
    console.log('Import committed:', counts);
  } finally {
    await pool.end();
  }
}

// Importing the functions in a test must not execute the command-line script.
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    console.error(
      'Import failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    process.exitCode = 1;
  });
}
