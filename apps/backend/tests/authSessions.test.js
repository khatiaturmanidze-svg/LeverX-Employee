import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import bcrypt from 'bcrypt';
import { createApp } from '../dist/app.js';
import { createTestDatabase, sqlTestOptions } from './helpers/postgres.js';
import { createBrowserClient, testSessionOptions } from './helpers/sessions.js';
import {
  IDLE_TIMEOUT_MS,
  STANDARD_ABSOLUTE_MS,
  REMEMBERED_ABSOLUTE_MS,
} from '../dist/config/session.js';
import { loadEnvironment } from '../dist/config/environment.js';

async function setup(t, overrides = {}, database) {
  const db = database ?? (await createTestDatabase(t));
  const defaults = testSessionOptions(t, db);
  const options = {
    ...defaults,
    ...overrides,
    session: { ...defaults.session, ...overrides.session },
    frontendPort: 5173,
    staticDirectory: fileURLToPath(new URL('../dist/', import.meta.url)),
  };
  const app = createApp(db.prisma, options);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  db.addCleanup(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  async function account(
    id,
    { role = 'Employee', managerId, temporary = false } = {},
  ) {
    const password = `${id}-password-original`;
    await db.prisma.employee.create({
      data: {
        id,
        firstName: id,
        lastName: 'Example',
        email: `${id}@example.test`,
        role,
        managerId,
        birthYear: 1990,
        citizenship: 'Private travel data',
        authUser: {
          create: {
            email: `${id}@example.test`,
            hashedPassword: await bcrypt.hash(password, 4),
            mustChangePassword: temporary,
          },
        },
      },
    });
    return { email: `${id}@example.test`, password };
  }
  const browser = () => createBrowserClient(base, options);
  async function login(client, credentials, rememberMe = false) {
    const result = await client.request('/sign-in', {
      method: 'POST',
      body: { ...credentials, rememberMe },
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    return result;
  }
  return { ...db, options, base, account, browser, login };
}

test('environment configuration rejects unsafe origins and blanket proxy trust', () => {
  const base = {
    DATABASE_URL: 'postgresql://localhost/employee_test',
    SESSION_SECRET: 'a-stable-random-secret-at-least-32-bytes',
    APP_ORIGIN: 'http://localhost:5173',
  };
  for (const patch of [
    { SESSION_SECRET: '' },
    { APP_ORIGIN: 'https://app.example/path' },
    { APP_ORIGIN: 'https://user:pass@app.example' },
    { APP_ORIGIN: 'https://app.example?x=1' },
    { NODE_ENV: 'production' },
    { TRUST_PROXY: 'true' },
  ]) {
    assert.throws(() => loadEnvironment({ ...base, ...patch }));
  }
  assert.deepEqual(
    loadEnvironment({ ...base, TRUST_PROXY: '127.0.0.1/32' }).trustProxy,
    ['127.0.0.1/32'],
  );
  assert.equal(
    loadEnvironment({
      ...base,
      NODE_ENV: 'production',
      APP_ORIGIN: 'https://app.example',
    }).allowPublicSignup,
    false,
  );
});

test(
  'independent cookie sessions identify accounts and reject forged credentials and cross-session CSRF',
  sqlTestOptions,
  async (t) => {
    const app = await setup(t);
    const alice = await app.account('alice');
    const bob = await app.account('bob');
    const a = app.browser();
    const b = app.browser();
    const anonymous = app.browser();
    await app.login(a, alice);
    await app.login(b, bob);
    assert.notEqual(a.cookie, b.cookie);
    assert.equal((await a.request('/me')).body.userId, 'alice');
    assert.equal((await b.request('/me')).body.userId, 'bob');
    assert.equal(
      (
        await anonymous.raw('/me', {
          headers: { authorization: 'invented-access-value' },
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await anonymous.raw('/me', {
          headers: { cookie: 'leverx.sid=invented' },
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await a.request('/sign-out', {
          method: 'POST',
          headers: { 'x-csrf-token': b.csrfToken },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await a.raw('/sign-out', {
          method: 'POST',
          headers: { 'x-csrf-token': '' },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await a.request('/users/upload', {
          method: 'POST',
          headers: { origin: 'https://malicious.example' },
        })
      ).status,
      403,
    );
    const wrong = await anonymous.request('/sign-in', {
      method: 'POST',
      body: { ...alice, password: 'incorrect' },
    });
    const missing = await anonymous.request('/sign-in', {
      method: 'POST',
      body: { email: 'missing@example.test', password: 'incorrect' },
    });
    assert.equal(wrong.status, 401);
    assert.equal(missing.status, 401);
    assert.deepEqual(wrong.body, missing.body);
    assert.equal((await anonymous.request('/me')).status, 401);
    const captured = a.cookie;
    assert.equal(
      (await a.request('/sign-out', { method: 'POST' })).status,
      204,
    );
    assert.equal(
      (await anonymous.raw('/me', { headers: { cookie: captured } })).status,
      401,
    );
  },
);

test(
  'employee, manager, HR, and administrator permissions are enforced against the actual target',
  sqlTestOptions,
  async (t) => {
    const app = await setup(t);
    const adminCredentials = await app.account('admin', { role: 'Admin' });
    const managerCredentials = await app.account('manager');
    const employeeCredentials = await app.account('employee', {
      managerId: 'manager',
    });
    const unrelatedCredentials = await app.account('unrelated');
    const hrCredentials = await app.account('hr', { role: 'HR' });
    const admin = app.browser();
    const manager = app.browser();
    const employee = app.browser();
    const unrelated = app.browser();
    const hr = app.browser();
    await app.login(admin, adminCredentials);
    await app.login(manager, managerCredentials);
    await app.login(employee, employeeCredentials);
    await app.login(unrelated, unrelatedCredentials);
    await app.login(hr, hrCredentials);
    assert.equal(
      (
        await employee.request('/users/unrelated', {
          method: 'PUT',
          body: { department: 'Forged' },
        })
      ).status,
      403,
    );
    const profile = await employee.request('/users/unrelated');
    assert.equal(profile.status, 200);
    assert.equal(profile.body._id, 'unrelated');
    assert.equal(profile.body.email, 'unrelated@example.test');
    assert.equal(profile.body.date_birth, undefined);
    assert.equal(profile.body.citizenship, undefined);
    assert.equal(profile.body.visa, undefined);
    assert.deepEqual(profile.body.requests, []);
    assert.equal((await employee.request('/requests/unrelated')).status, 403);
    assert.equal(
      (await employee.request('/employees/unrelated/visas')).status,
      403,
    );
    assert.equal((await hr.request('/users/unrelated')).status, 200);
    assert.equal((await manager.request('/users/unrelated')).status, 200);
    assert.ok((await admin.request('/users/unrelated')).body.date_birth);
    assert.ok((await manager.request('/users/employee')).body.date_birth);
    assert.equal((await employee.request('/users/missing')).status, 404);
    const directory = await employee.request('/users');
    const summary = directory.body.find((row) => row._id === 'unrelated');
    assert.equal(summary.date_birth, undefined);
    assert.equal(summary.citizenship, undefined);
    assert.equal(summary.visa, undefined);
    assert.deepEqual(summary.requests, []);
    assert.equal(
      (
        await manager.request('/users/employee', {
          method: 'PUT',
          body: { department: 'Engineering' },
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await manager.request('/users/unrelated', {
          method: 'PUT',
          body: { department: 'Forged' },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await manager.request('/users/employee', {
          method: 'PUT',
          body: { manager: 'unrelated' },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await manager.request('/users/employee', {
          method: 'PUT',
          body: { role: 'Admin' },
        })
      ).status,
      400,
    );
    for (const client of [employee, manager, hr]) {
      assert.equal(
        (
          await client.request('/users/employee/role', {
            method: 'PUT',
            body: { newRole: 'Admin' },
          })
        ).status,
        403,
      );
      assert.equal(
        (await client.request('/users', { method: 'POST', body: {} })).status,
        403,
      );
    }
    assert.equal(
      (
        await admin.request('/users/employee/role', {
          method: 'PUT',
          body: { newRole: 'SuperAdmin' },
        })
      ).status,
      400,
    );
    assert.equal(
      (await app.prisma.employee.findUnique({ where: { id: 'employee' } }))
        .role,
      'Employee',
    );
    const input = {
      issuing_country: 'Japanese',
      type: 'Work',
      start_date: '2026-01-01',
      end_date: '2027-01-01',
    };
    assert.equal(
      (
        await unrelated.request('/employees/employee/visas', {
          method: 'POST',
          body: input,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await employee.request('/employees/employee/visas', {
          method: 'POST',
          body: input,
        })
      ).status,
      201,
    );
    assert.equal(
      (await manager.request('/employees/employee/visas')).status,
      200,
    );
    await app.prisma.employee.update({
      where: { id: 'admin' },
      data: { role: 'Employee' },
    });
    assert.equal((await admin.request('/me')).body.role, 'Employee');
    assert.equal(
      (await admin.request('/users', { method: 'POST', body: {} })).status,
      403,
    );
  },
);

test(
  'leave ownership and approvals cannot be redirected using URL or body IDs',
  sqlTestOptions,
  async (t) => {
    const app = await setup(t);
    const managerCredentials = await app.account('manager');
    const aliceCredentials = await app.account('alice', {
      managerId: 'manager',
    });
    const bobCredentials = await app.account('bob');
    const manager = app.browser();
    const alice = app.browser();
    const bob = app.browser();
    await app.login(manager, managerCredentials);
    await app.login(alice, aliceCredentials);
    await app.login(bob, bobCredentials);
    const input = {
      type: 'Vacation',
      start_date: '2027-01-01',
      end_date: '2027-01-02',
      note: '',
    };
    assert.equal(
      (await alice.request('/requests/bob', { method: 'POST', body: input }))
        .status,
      403,
    );
    assert.equal(
      (
        await alice.request('/requests/alice', {
          method: 'POST',
          body: { ...input, employeeId: 'bob' },
        })
      ).status,
      403,
    );
    const created = await alice.request('/requests/alice', {
      method: 'POST',
      body: { ...input, status: 'approved', id: 'client-selected-id' },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.status, 'pending');
    assert.notEqual(created.body.id, 'client-selected-id');
    const update = { requestId: created.body.id, newStatus: 'approved' };
    assert.equal(
      (await alice.request('/requests/alice', { method: 'PUT', body: update }))
        .status,
      403,
    );
    assert.equal(
      (await bob.request('/requests/alice', { method: 'PUT', body: update }))
        .status,
      403,
    );
    assert.equal(
      (await manager.request('/requests/bob', { method: 'PUT', body: update }))
        .status,
      403,
    );
    assert.equal(
      (
        await app.prisma.leaveRequest.findUnique({
          where: { id: created.body.id },
        })
      ).status,
      'pending',
    );
    assert.equal(
      (
        await manager.request('/requests/alice', {
          method: 'PUT',
          body: update,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await manager.request('/requests/alice', {
          method: 'PUT',
          body: { ...update, newStatus: 'rejected' },
        })
      ).status,
      404,
    );
  },
);

test(
  'temporary-password restrictions and replacement protect the verified account and revoke old sessions',
  sqlTestOptions,
  async (t) => {
    const app = await setup(t);
    const credentials = await app.account('temporary', { temporary: true });
    await app.account('victim');
    const victim = await app.prisma.authUser.findUnique({
      where: { employeeId: 'victim' },
    });
    const first = app.browser();
    const second = app.browser();
    await app.login(first, credentials, true);
    await app.login(second, credentials);
    assert.equal((await first.request('/me')).body.mustChangePassword, true);
    for (const path of [
      '/users',
      '/requests/temporary',
      '/employees/temporary/visas',
    ]) {
      const denied = await first.request(path);
      assert.equal(denied.status, 403);
      assert.equal(denied.body.code, 'PASSWORD_CHANGE_REQUIRED');
    }
    const forged = await first.request('/set-new-password', {
      method: 'POST',
      body: {
        email: 'victim@example.test',
        newPassword: 'replacement-password',
      },
    });
    assert.equal(forged.status, 400);
    for (const password of ['short', '🔐'.repeat(19)])
      assert.equal(
        (
          await first.request('/set-new-password', {
            method: 'POST',
            body: { newPassword: password },
          })
        ).status,
        400,
      );
    const result = await first.request('/set-new-password', {
      method: 'POST',
      body: { newPassword: 'replacement-password' },
    });
    assert.equal(result.status, 200);
    assert.match(result.body.csrfToken, /^[a-f0-9]{64}$/);
    assert.equal((await first.request('/me')).body.mustChangePassword, false);
    assert.equal((await first.request('/users')).status, 200);
    assert.equal((await second.request('/me')).status, 401);
    const updated = await app.prisma.authUser.findUnique({
      where: { employeeId: 'temporary' },
    });
    assert.equal(updated.sessionVersion, 1);
    assert.equal(updated.mustChangePassword, false);
    assert.equal(
      await bcrypt.compare('replacement-password', updated.hashedPassword),
      true,
    );
    assert.equal(
      (
        await app.prisma.authUser.findUnique({
          where: { employeeId: 'victim' },
        })
      ).hashedPassword,
      victim.hashedPassword,
    );
    const preference = await app.pool.query(
      "SELECT (sess->>'rememberMe')::boolean AS remembered FROM web_sessions WHERE sess->>'employeeId' = 'temporary' AND (sess->>'sessionVersion')::int = 1",
    );
    assert.equal(preference.rows[0].remembered, true);
  },
);

test(
  'server timestamps enforce idle and absolute timeouts independently of cookie replay',
  sqlTestOptions,
  async (t) => {
    let now = Date.now();
    const app = await setup(t, { now: () => now });
    const credentials = await app.account('timed');
    const browser = app.browser();
    await app.login(browser, credentials);
    let state = await app.pool.query(
      "SELECT (sess->>'lastSeenAt')::bigint AS last, (sess->>'authenticatedAt')::bigint AS started, (sess->>'absoluteExpiresAt')::bigint AS expires FROM web_sessions WHERE sess->>'employeeId' = 'timed'",
    );
    const row = state.rows[0];
    assert.equal(
      Number(row.expires) - Number(row.started),
      STANDARD_ABSOLUTE_MS,
    );
    const replay = browser.cookie;
    now = Number(row.last) + IDLE_TIMEOUT_MS;
    assert.equal(
      (await browser.raw('/me', { headers: { cookie: replay } })).status,
      401,
    );
    now = Date.now();
    await app.login(browser, credentials);
    state = await app.pool.query(
      "SELECT (sess->>'authenticatedAt')::bigint AS started FROM web_sessions WHERE sess->>'employeeId' = 'timed'",
    );
    const start = Number(state.rows[0].started);
    for (
      let elapsed = 20 * 60 * 1000;
      elapsed < STANDARD_ABSOLUTE_MS;
      elapsed += 20 * 60 * 1000
    ) {
      now = start + elapsed;
      assert.equal((await browser.request('/me')).status, 200);
    }
    now = start + STANDARD_ABSOLUTE_MS;
    assert.equal((await browser.request('/me')).status, 401);
    now = Date.now();
    await app.login(browser, credentials, true);
    state = await app.pool.query(
      "SELECT (sess->>'authenticatedAt')::bigint AS started, (sess->>'absoluteExpiresAt')::bigint AS expires FROM web_sessions WHERE sess->>'employeeId' = 'timed'",
    );
    assert.equal(
      Number(state.rows[0].expires) - Number(state.rows[0].started),
      REMEMBERED_ABSOLUTE_MS,
    );
  },
);

test(
  'session/account-store failures fail closed and audit events contain no credentials',
  sqlTestOptions,
  async (t) => {
    const events = [];
    const app = await setup(t, { audit: (event) => events.push(event) });
    const credentials = await app.account('audit');
    const browser = app.browser();
    await app.login(browser, credentials);
    const originalGet = app.options.session.store.get;
    app.options.session.store.get = (_id, callback) =>
      callback(new Error('sensitive-cookie-or-database-url'));
    assert.equal((await browser.raw('/me')).status, 503);
    app.options.session.store.get = originalGet;
    const find = app.prisma.authUser.findUnique;
    app.prisma.authUser.findUnique = async () => {
      throw new Error('password-must-not-be-logged');
    };
    assert.equal((await browser.raw('/me')).status, 503);
    app.prisma.authUser.findUnique = find;
    const logged = JSON.stringify(events);
    assert.equal(logged.includes(credentials.password), false);
    assert.equal(logged.includes(browser.csrfToken), false);
    assert.equal(logged.includes(browser.cookie), false);
    assert.ok(
      events.some(
        (event) => event.event === 'login' && event.actorId === 'audit',
      ),
    );
  },
);

test(
  'secure cookies honor explicit proxy trust and production signup is disabled by default',
  sqlTestOptions,
  async (t) => {
    const app = await setup(t, {
      appOrigin: 'https://app.example',
      trustProxy: ['loopback'],
      session: { production: true },
    });
    const credentials = await app.account('https');
    const browser = app.browser();
    const headers = { 'x-forwarded-proto': 'https' };
    const csrf = await browser.raw('/csrf', { headers });
    const flags = csrf.headers.getSetCookie()[0];
    assert.match(flags, /^__Host-leverx\.sid=/);
    assert.match(flags, /HttpOnly/);
    assert.match(flags, /Secure/);
    assert.match(flags, /SameSite=Lax/);
    assert.match(flags, /Path=\//);
    assert.doesNotMatch(flags, /Domain=/);
    const login = await browser.raw('/sign-in', {
      method: 'POST',
      headers,
      body: credentials,
    });
    assert.equal(login.status, 200);
    const signup = await browser.raw('/sign-up', {
      method: 'POST',
      headers,
      body: { ...credentials, first_name: 'No', last_name: 'Signup' },
    });
    assert.equal(signup.status, 403);
    const logout = await browser.raw('/sign-out', { method: 'POST', headers });
    assert.equal(logout.status, 204);
    assert.match(logout.headers.getSetCookie()[0], /^__Host-leverx\.sid=;/);
    const untrusted = await setup(
      t,
      { appOrigin: 'https://app.example', session: { production: true } },
      app,
    );
    const spoofed = await untrusted.browser().raw('/csrf', { headers });
    assert.equal(spoofed.headers.get('set-cookie'), null);
  },
);

test(
  'public session abuse limits are shared across API instances',
  sqlTestOptions,
  async (t) => {
    const rateLimits = {
      auth: { limit: 2, windowMs: 60000 },
      csrf: { limit: 2, windowMs: 60000 },
    };
    const first = await setup(t, { rateLimits });
    const second = await setup(t, { rateLimits }, first);
    assert.equal((await first.browser().raw('/csrf')).status, 200);
    assert.equal((await second.browser().raw('/csrf')).status, 200);
    const rejected = await first.browser().raw('/csrf');
    assert.equal(rejected.status, 429);
    assert.ok(Number(rejected.headers.get('retry-after')) > 0);
  },
);
