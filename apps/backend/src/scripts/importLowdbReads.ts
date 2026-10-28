// Import a JSON snapshot through Prisma. The source file is never modified.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import type { PrismaClient } from '../generated/prisma/client.js';
import type { IEmployee, IRequestData, IVisa } from '../employeeTypes.js';
import type { IAuthUser } from '../serverTypes.js';
import { createPrismaClient } from '../prisma.js';
import { toEmployeeData } from '../mappers/employeeMapper.js';

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

export function validateAuthUsers(
  source: unknown,
  employees: IEmployee[],
): IAuthUser[] {
  const snapshot = object(source, 'Snapshot');
  const emails = new Set<string>();

  if (!Array.isArray(snapshot.authUsers))
    throw new Error('Snapshot.authUsers must be an array');

  const authUsers = snapshot.authUsers.map((value, position): IAuthUser => {
    const label = `authUsers[${position}]`;
    const row = object(value, label);
    const email = text(row.email, `${label}.email`).trim().toLowerCase();
    if (emails.has(email))
      throw new Error(`${label} has a duplicate auth email`);
    emails.add(email);
    const employee = employees.find(
      (candidate) => candidate.email.trim().toLowerCase() === email,
    );

    if (!employee) {
      throw new Error(`${label} has no matching employee`);
    }

    if (
      row.must_change_password !== undefined &&
      typeof row.must_change_password !== 'boolean'
    ) {
      throw new Error(`${label}.must_change_password must be a boolean`);
    }

    if (
      typeof row.hashed_password !== 'string' ||
      !row.hashed_password.trim()
    ) {
      throw new Error(`${label}.hashed_password must be nonempty text`);
    }

    return {
      _id: employee._id,
      email,
      hashed_password: row.hashed_password,
      must_change_password: row.must_change_password ?? false,
    };
  });

  return authUsers;
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
      const email = identifier(row.email, `${label}.email`)
        .trim()
        .toLowerCase();
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
  prisma: PrismaClient,
  employees: ImportEmployee[],
  authUsers: IAuthUser[],
): Promise<void> {
  if (!employees.length) return;
  await prisma.$transaction(
    async (tx) => {
      const ids = employees.map((employee) => employee._id);
      const byId = new Map(
        employees.map((employee) => [employee._id, employee]),
      );
      const emails = new Set(
        employees.map((employee) => employee.email.trim().toLowerCase()),
      );
      const existing = await tx.employee.findMany({
        select: { id: true, email: true },
      });
      for (const row of existing) {
        const normalizedEmail = row.email.trim().toLowerCase();
        if (!byId.has(row.id) && !emails.has(normalizedEmail)) continue;
        const original = byId.get(row.id);
        if (
          !original ||
          original.email.trim().toLowerCase() !== normalizedEmail
        ) {
          throw new Error(
            'SQL employee ' + row.id + ' conflicts with the snapshot identity',
          );
        }
      }

      const sourceAuth = new Map(authUsers.map((user) => [user._id, user]));
      const authEmails = new Set(authUsers.map((user) => user.email));
      const existingAuth = await tx.authUser.findMany({
        select: { employeeId: true, email: true },
      });
      for (const row of existingAuth) {
        const email = row.email.trim().toLowerCase();
        if (!sourceAuth.has(row.employeeId) && !authEmails.has(email)) continue;
        if (sourceAuth.get(row.employeeId)?.email !== email) {
          throw new Error(
            'SQL credentials conflict with the snapshot identity',
          );
        }
      }

      // All profiles must exist before assigning managers from the same snapshot.
      for (const [sourcePosition, employee] of employees.entries()) {
        const data = {
          ...toEmployeeData(employee),
          managerId: null,
          sourcePosition,
        };
        await tx.employee.upsert({
          where: { id: employee._id },
          create: data,
          update: data,
        });
      }
      for (const employee of employees) {
        if (employee.manager?.id) {
          await tx.employee.update({
            where: { id: employee._id },
            data: { managerId: employee.manager.id },
          });
        }
      }

      await tx.visa.deleteMany({ where: { employeeId: { in: ids } } });
      await tx.leaveRequest.deleteMany({ where: { employeeId: { in: ids } } });
      for (const employee of employees) {
        if (employee.visa.length) {
          await tx.visa.createMany({
            data: employee.visa.map((visa, sourcePosition) => ({
              employeeId: employee._id,
              issuingCountry: visa.issuing_country,
              type: visa.type,
              startDateMs: BigInt(visa.start_date),
              endDateMs: BigInt(visa.end_date),
              sourcePosition,
            })),
          });
        }
        if (employee.requests.length) {
          await tx.leaveRequest.createMany({
            data: employee.requests.map((request, sourcePosition) => ({
              id: request.id,
              employeeId: employee._id,
              type: request.type,
              startDate: new Date(request.start_date + 'T00:00:00Z'),
              endDate: new Date(request.end_date + 'T00:00:00Z'),
              note: request.note,
              status: request.status,
              sourcePosition,
            })),
          });
        }
      }
      for (const user of authUsers) {
        await tx.authUser.upsert({
          where: { employeeId: user._id },
          create: {
            employeeId: user._id,
            email: user.email,
            hashedPassword: user.hashed_password,
            mustChangePassword: user.must_change_password ?? false,
          },
          // A retry must not restore an old password or password-change flag.
          update: { email: user.email },
        });
      }
    },
    { timeout: 30000 },
  );
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
  const authUsers = validateAuthUsers(source, employees);
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
    authUsers: authUsers.length,
  };
  console.log('Validated snapshot:', counts);
  if (args[0] === '--validate-only') {
    console.log('Validation finished. PostgreSQL was not contacted.');
    return;
  }
  if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is required for --import');
  const prisma = createPrismaClient();
  try {
    await importSnapshot(prisma, employees, authUsers);
    console.log('Import committed (snapshot counts):', counts);
  } finally {
    await prisma.$disconnect();
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
