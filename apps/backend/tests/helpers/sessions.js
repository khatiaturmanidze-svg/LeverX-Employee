import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { createSessionStore } from '../../dist/sessionStore.js';

export function testSessionOptions(_t, database) {
  const store = database?.pool
    ? createSessionStore(database.pool, database.schema, false)
    : new session.MemoryStore();
  database?.addCleanup?.(() => store.close());
  return {
    appOrigin: 'http://localhost:5173',
    audit: () => {},
    session: {
      store,
      secret: 'isolated-backend-test-session-secret',
      production: false,
    },
  };
}

export function createBrowserClient(base, options) {
  const browser = {};
  async function raw(
    path,
    { method = 'GET', body, rawBody, form, headers = {} } = {},
  ) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...((body !== undefined || rawBody !== undefined) && {
          'content-type': 'application/json',
        }),
        ...(browser.cookie && { cookie: browser.cookie }),
        origin: options.appOrigin,
        ...(browser.csrfToken && { 'x-csrf-token': browser.csrfToken }),
        ...headers,
      },
      body:
        form ??
        rawBody ??
        (body === undefined ? undefined : JSON.stringify(body)),
      signal: AbortSignal.timeout(10000),
    });
    // Each Set-Cookie is separate; Expires dates may contain commas.
    const cookies = response.headers.getSetCookie();
    for (const cookie of cookies) {
      const pair = cookie.split(';')[0];
      if (
        pair.startsWith('leverx.sid=') ||
        pair.startsWith('__Host-leverx.sid=')
      )
        browser.cookie = pair;
    }
    const text = await response.text();
    const data =
      text && response.headers.get('content-type')?.includes('application/json')
        ? JSON.parse(text)
        : text;
    if (data?.csrfToken) browser.csrfToken = data.csrfToken;
    return {
      status: response.status,
      body: data,
      text,
      headers: response.headers,
    };
  }
  return {
    raw,
    get cookie() {
      return browser.cookie;
    },
    get csrfToken() {
      return browser.csrfToken;
    },
    async request(path, request = {}) {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method ?? 'GET')) {
        const csrf = await raw('/csrf');
        assert.equal(csrf.status, 200, JSON.stringify(csrf.body));
      }
      return raw(path, request);
    },
  };
}

// Business-route fixtures authenticate with real bcrypt credentials. They use
// the same PostgreSQL session store and isolated schema as the running API.
export function createTestRequest(base, prisma, options) {
  const anonymous = createBrowserClient(base, options);
  const administrator = createBrowserClient(base, options);
  let login;
  async function authenticate() {
    if (!login)
      login = (async () => {
        const password = 'isolated-admin-password';
        const hash = await bcrypt.hash(password, 4);
        await prisma.employee.upsert({
          where: { id: 'test-session-actor' },
          create: {
            id: 'test-session-actor',
            email: 'session-actor@example.test',
            firstName: 'Session',
            lastName: 'Actor',
            role: 'Admin',
          },
          update: {},
        });
        await prisma.authUser.upsert({
          where: { employeeId: 'test-session-actor' },
          create: {
            employeeId: 'test-session-actor',
            email: 'session-actor@example.test',
            hashedPassword: hash,
          },
          update: {},
        });
        const result = await administrator.request('/sign-in', {
          method: 'POST',
          body: { email: 'session-actor@example.test', password },
        });
        assert.equal(result.status, 200, JSON.stringify(result.body));
      })();
    await login;
  }
  return async (path, request = {}) => {
    if (request.authenticated) await authenticate();
    return (request.authenticated ? administrator : anonymous).request(
      path,
      request,
    );
  };
}
