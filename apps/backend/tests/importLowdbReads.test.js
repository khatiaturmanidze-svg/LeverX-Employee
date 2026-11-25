import assert from 'node:assert/strict';
import test from 'node:test';
import {
  importSnapshot,
  validateSnapshot,
  validateAuthUsers,
} from '../dist/scripts/importLowdbReads.js';
import { createTestDatabase, sqlTestOptions } from './helpers/postgres.js';

function snapshot() {
  return {
    employees: [
      {
        _id: 'employee-1',
        email: "o'brien@example.test",
        first_name: 'Example',
        last_name: 'Employee',
        manager: { id: 'manager-1' },
        desk_number: '0',
        isRemoteWork: false,
        visa: [
          {
            issuing_country: 'Georgia',
            type: 'Work',
            start_date: '0',
            end_date: 1000,
          },
        ],
        requests: [
          {
            id: 'request-1',
            type: 'Vacation',
            start_date: '2026-01-01',
            end_date: '2026-01-02',
            status: 'pending',
          },
        ],
      },
      {
        _id: 'manager-1',
        email: 'manager@example.test',
        first_name: 'Example',
        last_name: 'Manager',
      },
    ],
  };
}

test('validation preserves existing IDs and accepts numeric strings without mutating the source', () => {
  const source = snapshot();
  const before = JSON.stringify(source);
  const employees = validateSnapshot(source);
  assert.equal(employees[0]._id, 'employee-1');
  assert.equal(employees[0].desk_number, 0);
  assert.equal(employees[0].visa[0].start_date, '1970-01-01');
  assert.equal(employees[0].visa[0].end_date, '1970-01-01');
  assert.equal(employees[0].requests[0].employeeId, 'employee-1');
  assert.deepEqual(employees[1].visa, []);
  assert.deepEqual(employees[1].requests, []);
  assert.equal(JSON.stringify(source), before);
});

test('validation rejects duplicate identities and broken manager references', () => {
  let source = snapshot();
  source.employees[1]._id = 'employee-1';
  assert.throws(() => validateSnapshot(source), /duplicate employee ID/);
  source = snapshot();
  source.employees[1].email = source.employees[0].email.toUpperCase();
  assert.throws(() => validateSnapshot(source), /duplicate email/);
  source = snapshot();
  source.employees[0].manager.id = 'missing-manager';
  assert.throws(() => validateSnapshot(source), /manager outside the snapshot/);
});

test('timestamp snapshot visas normalize to UTC dates and reject invalid ranges before import', () => {
  const source = snapshot();
  source.employees[0].visa[0].start_date = -1;
  assert.equal(validateSnapshot(source)[0].visa[0].start_date, '1969-12-31');
  source.employees[0].visa[0].start_date = Date.parse('2028-10-01T00:00:00Z');
  assert.throws(
    () => validateSnapshot(source),
    /End date must be on or after start date/,
  );
  source.employees[0].visa[0].start_date = Number.MAX_SAFE_INTEGER;
  assert.throws(() => validateSnapshot(source), /supported date range/);
});

test('validation rejects invalid request dates, statuses and ownership', () => {
  let source = snapshot();
  source.employees[0].requests[0].start_date = '2026-02-30';
  assert.throws(() => validateSnapshot(source), /valid YYYY-MM-DD/);
  source = snapshot();
  source.employees[0].requests[0].status = 'unknown';
  assert.throws(() => validateSnapshot(source), /status is invalid/);
  source = snapshot();
  source.employees[0].requests[0].employeeId = 'wrong-employee';
  assert.throws(() => validateSnapshot(source), /does not match its parent/);
  source = snapshot();
  source.employees[1].requests = [source.employees[0].requests[0]];
  assert.throws(() => validateSnapshot(source), /duplicate request ID/);
});

test('validation rejects invalid numeric fields and malformed arrays', () => {
  let source = snapshot();
  source.employees[0].desk_number = 'desk twelve';
  assert.throws(() => validateSnapshot(source), /PostgreSQL integer/);
  source = snapshot();
  source.employees[0].visa[0].start_date = '';
  assert.throws(() => validateSnapshot(source), /integer milliseconds/);
  source = snapshot();
  source.employees[0].requests = {};
  assert.throws(() => validateSnapshot(source), /must be an array/);
});

test('auth validation links normalized emails and rejects invalid hashes and flags', () => {
  const source = snapshot();
  source.authUsers = [
    { email: " O'BRIEN@EXAMPLE.TEST ", hashed_password: 'snapshot-hash' },
  ];
  const employees = validateSnapshot(source);
  assert.deepEqual(validateAuthUsers(source, employees), [
    {
      _id: 'employee-1',
      email: "o'brien@example.test",
      hashed_password: 'snapshot-hash',
      must_change_password: false,
    },
  ]);
  source.authUsers[0].hashed_password = undefined;
  assert.throws(() => validateAuthUsers(source, employees), /nonempty text/);
  source.authUsers[0].hashed_password = 'snapshot-hash';
  source.authUsers[0].must_change_password = 'false';
  assert.throws(
    () => validateAuthUsers(source, employees),
    /must be a boolean/,
  );
});

test(
  'Prisma import preserves identities and credentials when repeated',
  sqlTestOptions,
  async (t) => {
    const { prisma } = await createTestDatabase(t);
    const employees = validateSnapshot(snapshot());
    const authUsers = [
      {
        _id: employees[0]._id,
        email: employees[0].email,
        hashed_password: 'snapshot-hash',
      },
    ];
    await importSnapshot(prisma, employees, authUsers);
    const employee = await prisma.employee.findUnique({
      where: { id: 'employee-1' },
      include: { manager: true, visas: true, requests: true },
    });
    assert.equal(employee.manager.id, 'manager-1');
    assert.equal(
      employee.visas[0].start_date.toISOString(),
      '1970-01-01T00:00:00.000Z',
    );
    assert.equal(employee.requests[0].id, 'request-1');
    await prisma.authUser.update({
      where: { employeeId: 'employee-1' },
      data: { hashedPassword: 'changed-in-sql', mustChangePassword: true },
    });
    await importSnapshot(prisma, employees, authUsers);
    const credential = await prisma.authUser.findUnique({
      where: { employeeId: 'employee-1' },
    });
    assert.equal(credential.hashedPassword, 'changed-in-sql');
    assert.equal(credential.mustChangePassword, true);
    assert.equal(await prisma.visa.count(), 1);
    assert.equal(await prisma.leaveRequest.count(), 1);
  },
);

test(
  'a late Prisma import failure rolls back newly imported profiles',
  sqlTestOptions,
  async (t) => {
    const { prisma } = await createTestDatabase(t);
    await prisma.employee.create({
      data: {
        id: 'existing-owner',
        firstName: 'Existing',
        lastName: 'Owner',
        email: 'owner@example.test',
        requests: {
          create: {
            id: 'request-1',
            type: 'Vacation',
            startDate: new Date('2026-01-01T00:00:00Z'),
            endDate: new Date('2026-01-02T00:00:00Z'),
            sourcePosition: 0,
          },
        },
      },
    });
    await assert.rejects(
      importSnapshot(prisma, validateSnapshot(snapshot()), []),
      (error) => error.code === 'P2002',
    );
    assert.deepEqual(await prisma.employee.findMany({ select: { id: true } }), [
      { id: 'existing-owner' },
    ]);
    assert.equal(await prisma.leaveRequest.count(), 1);
    assert.equal(await prisma.visa.count(), 0);
  },
);

test(
  'conflicting SQL identities stop the Prisma import',
  sqlTestOptions,
  async (t) => {
    const { prisma } = await createTestDatabase(t);
    await prisma.employee.create({
      data: {
        id: 'different-id',
        firstName: 'Existing',
        lastName: 'Employee',
        email: "o'brien@example.test",
      },
    });
    await assert.rejects(
      importSnapshot(prisma, validateSnapshot(snapshot()), []),
      /conflicts with the snapshot identity/,
    );
    assert.equal(await prisma.employee.count(), 1);
  },
);

test('empty imports do not open a transaction', async () => {
  await importSnapshot(
    {
      $transaction: () => {
        throw new Error('Should not connect');
      },
    },
    [],
    [],
  );
});
