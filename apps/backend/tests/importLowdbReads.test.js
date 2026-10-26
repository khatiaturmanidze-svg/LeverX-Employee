import assert from 'node:assert/strict';
import test from 'node:test';
import {
  importSnapshot,
  validateSnapshot,
} from '../dist/scripts/importLowdbReads.js';

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

// This client never contacts PostgreSQL. It exercises ordering and failure handling.
function fakePool({ existing = [], failOn } = {}) {
  const calls = [];
  let released = false;
  const failure = new Error('Simulated SQL failure');
  const client = {
    async query(sql, values) {
      const command = sql.replace(/\s+/g, ' ').trim();
      calls.push({ command, values });
      if (failOn && command.startsWith(failOn)) throw failure;
      return { rows: command.startsWith('SELECT') ? existing : [] };
    },
    release() {
      released = true;
    },
  };
  return {
    connect: async () => client,
    calls,
    failure,
    wasReleased: () => released,
  };
}

test('validation preserves existing IDs and accepts numeric strings without mutating the source', () => {
  const source = snapshot();
  const before = JSON.stringify(source);
  const employees = validateSnapshot(source);
  assert.equal(employees[0]._id, 'employee-1');
  assert.equal(employees[0].desk_number, 0);
  assert.equal(employees[0].visa[0].start_date, 0);
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

test('import creates parents before links and commits parameterized data on one connection', async () => {
  const pool = fakePool();
  await importSnapshot(pool, validateSnapshot(snapshot()), []);
  assert.equal(pool.calls[0].command, 'BEGIN');
  assert.equal(pool.calls.at(-1).command, 'COMMIT');
  assert.equal(pool.wasReleased(), true);
  const employeeWrites = pool.calls.filter(({ command }) =>
    command.startsWith('INSERT INTO employees'),
  );
  assert.equal(employeeWrites.length, 2);
  const managerIndex = pool.calls.findIndex(({ command }) =>
    command.startsWith('UPDATE employees SET manager_id'),
  );
  assert.ok(managerIndex > pool.calls.indexOf(employeeWrites[1]));
  assert.deepEqual(pool.calls[managerIndex].values, [
    'manager-1',
    'employee-1',
  ]);
  assert.equal(employeeWrites[0].values[3], "o'brien@example.test");
  assert.equal(employeeWrites[0].command.includes("o'brien"), false);
  for (const call of pool.calls.filter(({ command }) =>
    command.startsWith('DELETE'),
  )) {
    assert.match(call.command, /WHERE employee_id = ANY\(\$1::text\[\]\)/);
    assert.deepEqual(call.values, [['employee-1', 'manager-1']]);
  }
  const requestWrite = pool.calls.find(({ command }) =>
    command.startsWith('INSERT INTO requests'),
  );
  assert.equal(requestWrite.values[0], 'request-1');
  assert.equal(requestWrite.values[1], 'employee-1');
  assert.equal(requestWrite.values.at(-1), 0);
});

test('SQL failure rolls back instead of committing and releases the connection', async () => {
  const pool = fakePool({ failOn: 'INSERT INTO requests' });
  await assert.rejects(
    importSnapshot(pool, validateSnapshot(snapshot()), []),
    (error) => error === pool.failure,
  );
  assert.equal(pool.calls.at(-1).command, 'ROLLBACK');
  assert.equal(
    pool.calls.some(({ command }) => command === 'COMMIT'),
    false,
  );
  assert.equal(pool.wasReleased(), true);
});

test('conflicting SQL identities fail before employee writes or related-row replacement', async () => {
  const pool = fakePool({
    existing: [{ id: 'different-id', email: "o'brien@example.test" }],
  });
  await assert.rejects(
    importSnapshot(pool, validateSnapshot(snapshot()), []),
    /conflicts with the snapshot identity/,
  );
  assert.equal(
    pool.calls.some(
      ({ command }) =>
        command.startsWith('INSERT') || command.startsWith('DELETE'),
    ),
    false,
  );
  assert.equal(pool.calls.at(-1).command, 'ROLLBACK');
  assert.equal(pool.wasReleased(), true);
});

test('empty imports do not acquire a connection', async () => {
  await importSnapshot(
    {
      connect: () => {
        throw new Error('Should not connect');
      },
    },
    validateSnapshot({ employees: [] }),
    [],
  );
});
