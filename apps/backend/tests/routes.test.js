import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { Low, Memory } from 'lowdb';
import xlsx from 'xlsx';
import { createApp } from '../dist/app.js';

async function setup(t, latency = '') {
  const environment = {
    BCRYPT_SALT_ROUNDS: '4',
    SYNTHETIC_LATENCY_MIN: latency,
    SYNTHETIC_LATENCY_MAX: latency,
  };
  for (const [key, value] of Object.entries(environment)) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    });
  }
  const db = new Low(new Memory(), { authUsers: [], employees: [] });
  const app = createApp(db, {
    token: 'test-token',
    frontendPort: 5173,
    staticDirectory: fileURLToPath(new URL('../dist', import.meta.url)),
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  );
  async function request(path, { method = 'GET', body, token, form } = {}) {
    const headers = {};
    if (token) headers.authorization = token;
    if (body !== undefined) headers['content-type'] = 'application/json';
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}${path}`,
      {
        method,
        headers,
        body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
      },
    );
    const text = await response.text();
    return {
      status: response.status,
      body: response.headers.get('content-type')?.includes('application/json')
        ? JSON.parse(text)
        : text,
      headers: response.headers,
    };
  }
  return { db, request };
}

const signup = {
  first_name: 'Test',
  last_name: 'Employee',
  email: 'test@example.com',
  password: 'original-password',
};
const employee = {
  first_name: 'New',
  last_name: 'Employee',
  email: 'new@example.com',
  department: 'Engineering',
  building: 'A',
  room: '1',
};

test('health remains public and bypasses synthetic latency while business routes use it', async (t) => {
  const { request } = await setup(t, '9876');
  const originalTimeout = globalThis.setTimeout;
  let delays = 0;
  t.mock.method(globalThis, 'setTimeout', (callback, delay, ...args) => {
    if (delay === 9876) {
      delays++;
      return originalTimeout(callback, 0, ...args);
    }
    return originalTimeout(callback, delay, ...args);
  });
  const health = await request('/health');
  assert.equal(health.status, 200);
  assert.deepEqual(health.body, { message: 'Server is running' });
  assert.equal(
    health.headers.get('access-control-allow-origin'),
    'http://localhost:5173',
  );
  assert.equal(delays, 0);
  assert.equal((await request('/users')).status, 401);
  assert.equal(delays, 1);
  assert.equal((await request('/users', { token: 'wrong' })).status, 403);
});

test('signup, sign-in, and forced password changes preserve their contracts', async (t) => {
  const { request } = await setup(t);
  assert.equal(
    (await request('/sign-in', { method: 'POST', body: signup })).status,
    400,
  );
  const registered = await request('/sign-up', {
    method: 'POST',
    body: signup,
  });
  assert.equal(registered.status, 200);
  assert.equal(registered.body.employee.role, 'Employee');
  assert.deepEqual(
    (await request('/sign-up', { method: 'POST', body: signup })).body,
    { error: 'email already exists' },
  );
  assert.equal(
    (
      await request('/sign-in', {
        method: 'POST',
        body: { ...signup, password: 'wrong' },
      })
    ).status,
    401,
  );
  const login = await request('/sign-in', { method: 'POST', body: signup });
  assert.deepEqual(login.body, {
    message: 'signed in!',
    token: 'test-token',
    userId: registered.body.employee._id,
    mustChangePassword: false,
  });
  const created = await request('/users', {
    method: 'POST',
    token: 'test-token',
    body: employee,
  });
  assert.equal(created.status, 201);
  const credentials = {
    email: employee.email,
    password: created.body.temporaryPassword,
  };
  assert.equal(
    (await request('/sign-in', { method: 'POST', body: credentials })).body
      .mustChangePassword,
    true,
  );
  const change = {
    method: 'POST',
    token: 'test-token',
    body: { email: employee.email, newPassword: 'replacement' },
  };
  assert.equal((await request('/set-new-password', change)).status, 200);
  assert.equal((await request('/set-new-password', change)).status, 400);
  assert.equal(
    (await request('/sign-in', { method: 'POST', body: credentials })).status,
    401,
  );
  assert.equal(
    (
      await request('/sign-in', {
        method: 'POST',
        body: { ...credentials, password: 'replacement' },
      })
    ).body.mustChangePassword,
    false,
  );
});

test('employee list, detail, creation, editing, and role routes keep existing behavior', async (t) => {
  const { request, db } = await setup(t);
  const token = 'test-token';
  assert.equal(
    (await request('/users', { method: 'POST', token, body: {} })).status,
    400,
  );
  const created = await request('/users', {
    method: 'POST',
    token,
    body: employee,
  });
  const id = created.body.employee._id;
  assert.equal(
    (await request('/users', { method: 'POST', token, body: employee })).status,
    400,
  );
  assert.equal((await request('/users', { token })).body.length, 1);
  assert.equal(
    (await request(`/users/${id}`, { token })).body.email,
    employee.email,
  );
  assert.equal((await request('/users/missing', { token })).status, 400);
  // Existing employee edits are public; this refactor does not change authorization policy.
  const updated = await request(`/users/${id}`, {
    method: 'PUT',
    body: { department: 'Design' },
  });
  assert.equal(updated.body.employee.department, 'Design');
  assert.equal(
    (await request('/users/missing', { method: 'PUT', body: {} })).status,
    404,
  );
  assert.equal(
    (
      await request(`/users/${id}/role`, {
        method: 'PUT',
        body: { newRole: 'Admin' },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request(`/users/${id}/role`, {
        method: 'PUT',
        token,
        body: { newRole: 'Admin' },
      })
    ).body.employee.role,
    'Admin',
  );
  db.data.employees[0]._id = '11';
  await db.write();
  assert.deepEqual(
    (
      await request('/users/11/role', {
        method: 'PUT',
        token,
        body: { newRole: 'Employee' },
      })
    ).body,
    { error: 'Cannot edit your own role.' },
  );
});

test('request routes retain creation status, generated IDs, updates, and error shapes', async (t) => {
  const { request } = await setup(t);
  const registered = await request('/sign-up', {
    method: 'POST',
    body: signup,
  });
  const id = registered.body.employee._id;
  assert.deepEqual((await request(`/requests/${id}`)).body, []);
  const created = await request(`/requests/${id}`, {
    method: 'POST',
    body: {
      id: 'client-id',
      employeeId: 'wrong-id',
      status: 'approved',
      type: 'leave',
      start_date: '2026-10-10',
      end_date: '2026-10-11',
      note: '',
    },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'pending');
  assert.equal(created.body.employeeId, id);
  assert.notEqual(created.body.id, 'client-id');
  assert.equal((await request(`/requests/${id}`)).body.length, 1);
  const updated = await request(`/requests/${id}`, {
    method: 'PUT',
    body: { requestId: created.body.id, newStatus: 'approved' },
  });
  assert.equal(updated.body.status, 'approved');
  assert.equal((await request('/requests/missing')).status, 401);
  assert.equal(
    (await request('/requests/missing', { method: 'POST', body: {} })).status,
    401,
  );
  assert.deepEqual(
    (
      await request(`/requests/${id}`, {
        method: 'PUT',
        body: { requestId: 'missing', newStatus: 'approved' },
      })
    ).body,
    { message: 'Request not found' },
  );
  assert.deepEqual(
    (await request('/requests/missing', { method: 'PUT', body: {} })).body,
    { message: 'Employee not found' },
  );
});

test('spreadsheet upload imports valid rows and reports duplicates and incomplete rows', async (t) => {
  const { request, db } = await setup(t);
  assert.equal(
    (await request('/users/upload', { method: 'POST', token: 'test-token' }))
      .status,
    400,
  );
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(
    workbook,
    xlsx.utils.json_to_sheet([
      employee,
      employee,
      { email: 'incomplete@example.com' },
    ]),
  );
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const form = new FormData();
  form.append('file', new Blob([buffer]), 'employees.xlsx');
  const uploaded = await request('/users/upload', {
    method: 'POST',
    token: 'test-token',
    form,
  });
  assert.equal(uploaded.status, 200);
  assert.equal(uploaded.body.count, 1);
  assert.deepEqual(uploaded.body.skippedRows, [
    { row: 3, email: employee.email, error: 'email already exists' },
    {
      row: 4,
      email: 'incomplete@example.com',
      error: 'missing required fields',
    },
  ]);
  assert.equal(db.data.authUsers[0].must_change_password, true);
  const user = uploaded.body.importedUsers[0];
  assert.equal(
    (
      await request('/sign-in', {
        method: 'POST',
        body: { email: user.email, password: user.temporaryPassword },
      })
    ).status,
    200,
  );
  t.mock.method(db, 'write', async () => {
    throw new Error('Storage failure');
  });
  const failed = await request('/users/upload', {
    method: 'POST',
    token: 'test-token',
    form,
  });
  assert.equal(failed.status, 500);
  assert.deepEqual(failed.body, { error: 'failed to read spreadsheet' });
});
