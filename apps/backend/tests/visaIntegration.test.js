import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createApp } from '../dist/app.js';
import { createTestDatabase, sqlTestOptions } from './helpers/postgres.js';

const collection = '/employees/employee-a/visas';
const input = {
  issuing_country: 'Japanese',
  type: 'Work',
  start_date: '2026-10-01',
  end_date: '2027-10-01',
};

async function setup(t) {
  const database = await createTestDatabase(t);
  const { prisma } = database;
  await prisma.employee.createMany({
    data: ['a', 'b'].map((letter) => ({
      id: `employee-${letter}`,
      firstName: letter.toUpperCase(),
      lastName: 'Test',
      email: `${letter}@example.test`,
    })),
  });
  const app = createApp(prisma, {
    token: 'test-token',
    frontendPort: 5173,
    staticDirectory: fileURLToPath(new URL('../dist/', import.meta.url)),
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

  async function request(
    path = collection,
    { method = 'GET', body, rawBody, token = 'test-token' } = {},
  ) {
    const headers = {};
    if (token) headers.authorization = token;
    if (body !== undefined || rawBody !== undefined)
      headers['content-type'] = 'application/json';
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}${path}`,
      {
        method,
        headers,
        body:
          rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
        signal: AbortSignal.timeout(10000),
      },
    );
    const text = await response.text();
    return {
      status: response.status,
      text,
      body:
        text &&
        response.headers.get('content-type')?.includes('application/json')
          ? JSON.parse(text)
          : text,
    };
  }

  function seedVisa(overrides = {}) {
    return prisma.visa.create({
      data: {
        ...input,
        employeeId: 'employee-a',
        start_date: new Date(`${input.start_date}T00:00:00Z`),
        end_date: new Date(`${input.end_date}T00:00:00Z`),
        sourcePosition: 0,
        ...overrides,
      },
    });
  }
  return { ...database, request, seedVisa };
}

function assertError(response, status) {
  assert.equal(response.status, status, JSON.stringify(response.body));
  assert.equal(typeof response.body.error, 'string');
}

test(
  'visa endpoints reject missing/wrong tokens without changing stored rows',
  sqlTestOptions,
  async (t) => {
    const { prisma, request, seedVisa } = await setup(t);
    const row = await seedVisa();
    for (const token of ['', 'wrong']) {
      for (const [method, path, body] of [
        ['GET', collection],
        ['GET', `${collection}/${row.id}`],
        ['POST', collection, input],
        ['PATCH', `${collection}/${row.id}`, { type: 'Tourist' }],
        ['DELETE', `${collection}/${row.id}`],
      ]) {
        assertError(
          await request(path, { method, body, token }),
          token ? 403 : 401,
        );
      }
    }
    assert.deepEqual(await prisma.visa.findMany(), [row]);
  },
);

test(
  'visa endpoints distinguish empty collections, missing employees, and missing items',
  sqlTestOptions,
  async (t) => {
    const { request } = await setup(t);
    assert.deepEqual((await request()).body, {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });
    const missing = '/employees/missing/visas';
    for (const [method, path, body] of [
      ['GET', missing],
      ['GET', `${missing}/1`],
      ['POST', missing, input],
      ['PATCH', `${missing}/1`, { type: 'Tourist' }],
      ['DELETE', `${missing}/1`],
      ['GET', `${collection}/1`],
      ['PATCH', `${collection}/1`, { type: 'Tourist' }],
      ['DELETE', `${collection}/1`],
    ]) {
      assertError(await request(path, { method, body }), 404);
    }
    assertError(await request(missing, { method: 'POST', body: {} }), 400);
  },
);

test(
  'visa pagination filters and counts only the URL employee in stable order',
  sqlTestOptions,
  async (t) => {
    const { request, seedVisa } = await setup(t);
    const last = await seedVisa({ sourcePosition: 9 });
    const first = await seedVisa({ sourcePosition: 0 });
    const middle = await seedVisa({ sourcePosition: 4 });
    await seedVisa({ sourcePosition: 2, issuing_country: 'Georgian' });
    await seedVisa({ sourcePosition: 7, issuing_country: 'Georgian' });
    await seedVisa({ employeeId: 'employee-b', sourcePosition: 0 });

    const defaults = await request();
    assert.equal(defaults.status, 200);
    assert.equal(defaults.body.page, 1);
    assert.equal(defaults.body.limit, 20);
    assert.equal(defaults.body.total, 5);
    const firstPage = await request(
      `${collection}?issuing_country=%20jApAnEsE%20&limit=2&page=1`,
    );
    assert.equal(firstPage.status, 200);
    assert.deepEqual(
      firstPage.body.items.map((visa) => visa.id),
      [first.id, middle.id].map(String),
    );
    assert.equal(firstPage.body.total, 3);
    assert.equal(firstPage.body.limit, 2);
    const secondPage = await request(
      `${collection}?issuing_country=japanese&limit=2&page=2`,
    );
    assert.equal(secondPage.body.page, 2);
    assert.equal(secondPage.body.total, 3);
    assert.deepEqual(
      secondPage.body.items.map((visa) => visa.id),
      [String(last.id)],
    );
    assert.deepEqual(
      (await request(`${collection}?issuing_country=japanese&limit=2&page=3`))
        .body,
      { items: [], total: 3, page: 3, limit: 2 },
    );
    assert.deepEqual(
      (await request(`${collection}?issuing_country=unmatched`)).body,
      { items: [], total: 0, page: 1, limit: 20 },
    );
    assert.deepEqual(
      (await request(`${collection}?issuing_country=%20%20`)).body,
      defaults.body,
    );
  },
);

test(
  'invalid visa bodies and merged PATCH ranges leave persisted data unchanged',
  sqlTestOptions,
  async (t) => {
    const { prisma, request, seedVisa } = await setup(t);
    const row = await seedVisa();
    const item = `${collection}/${row.id}`;
    const before = (await request(item)).body;
    const invalidCreates = [
      {},
      null,
      [],
      { ...input, issuing_country: ' ' },
      { ...input, type: ' ' },
      { ...input, start_date: 0 },
      { ...input, start_date: '2026-02-30' },
      { ...input, start_date: '0000-01-01' },
      { ...input, start_date: '2026-10-01T00:00:00Z' },
      { ...input, start_date: '2028-10-01' },
      { ...input, id: '12' },
      { ...input, employeeId: 'employee-b' },
      { ...input, sourcePosition: 2 },
    ];
    for (const body of invalidCreates) {
      assertError(await request(collection, { method: 'POST', body }), 400);
    }
    for (const body of [
      {},
      null,
      [],
      { id: '12' },
      { employeeId: 'employee-b' },
      { sourcePosition: 2 },
      { type: '' },
      { start_date: '2028-10-01' },
      { end_date: '2025-10-01' },
    ]) {
      assertError(await request(item, { method: 'PATCH', body }), 400);
      assert.deepEqual((await request(item)).body, before);
    }
    assert.deepEqual(await prisma.visa.findMany(), [row]);
    const patched = await request(item, {
      method: 'PATCH',
      body: { end_date: '2028-10-01' },
    });
    assert.equal(patched.status, 200);
    assert.deepEqual(patched.body, { ...before, end_date: '2028-10-01' });
    assert.equal(
      (
        await prisma.visa.findUnique({ where: { id: row.id } })
      ).end_date.toISOString(),
      '2028-10-01T00:00:00.000Z',
    );
  },
);

test(
  'visa URL/query validation and JSON errors return controlled client responses',
  sqlTestOptions,
  async (t) => {
    const { request, prisma } = await setup(t);
    for (const id of ['0', '-1', '1.5', '12abc', '9223372036854775808']) {
      for (const method of ['GET', 'PATCH', 'DELETE']) {
        assertError(
          await request(`${collection}/${id}`, {
            method,
            ...(method === 'PATCH' ? { body: { type: 'Work' } } : {}),
          }),
          400,
        );
      }
    }
    for (const query of [
      'page=0',
      'page=-1',
      'page=1.5',
      'page=abc',
      'limit=0',
      'limit=101',
      'page=9007199254740992',
      'page=2147483648&limit=2',
      'limit=1&limit=2',
      'issuing_country=a&issuing_country=b',
      'issuing_country[x]=a',
      'unexpected=x',
    ]) {
      assertError(await request(`${collection}?${query}`), 400);
    }
    for (const [rawBody, status] of [
      ['{', 400],
      [JSON.stringify({ ...input, type: 'x'.repeat(110000) }), 413],
    ]) {
      assertError(
        await request(collection, { method: 'POST', rawBody }),
        status,
      );
    }
    assert.equal(await prisma.visa.count(), 0);
  },
);

test(
  'visa item operations preserve IDs above JavaScript integer precision',
  sqlTestOptions,
  async (t) => {
    const { pool, prisma, request, seedVisa } = await setup(t);
    await pool.query(
      'ALTER TABLE visas ALTER COLUMN id RESTART WITH 9007199254740993',
    );
    const row = await seedVisa();
    const item = `${collection}/${row.id}`;
    const detail = await request(item);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.id, '9007199254740993');
    const embedded = await request('/users/employee-a');
    assert.deepEqual(embedded.body.visa, [detail.body]);
    const patched = await request(item, {
      method: 'PATCH',
      body: { type: 'Tourist' },
    });
    assert.equal(patched.status, 200);
    assert.deepEqual(patched.body, { ...detail.body, type: 'Tourist' });
    const deleted = await request(item, { method: 'DELETE' });
    assert.equal(deleted.status, 204);
    assert.equal(deleted.text, '');
    assert.equal(await prisma.visa.count(), 0);
    for (const method of ['GET', 'PATCH', 'DELETE']) {
      assertError(
        await request(item, {
          method,
          ...(method === 'PATCH' ? { body: { type: 'Work' } } : {}),
        }),
        404,
      );
    }
  },
);

test(
  'concurrent visa POSTs append after gaps without duplicate IDs or positions',
  sqlTestOptions,
  async (t) => {
    const { prisma, request, seedVisa } = await setup(t);
    await seedVisa({ sourcePosition: 0 });
    await seedVisa({ sourcePosition: 3 });
    const created = await Promise.all(
      ['Tourist', 'Residence'].map((type) =>
        request(collection, { method: 'POST', body: { ...input, type } }),
      ),
    );
    for (const response of created)
      assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.notEqual(created[0].body.id, created[1].body.id);
    const rows = await prisma.visa.findMany({
      where: { employeeId: 'employee-a' },
      orderBy: { sourcePosition: 'asc' },
    });
    assert.deepEqual(
      rows.map((row) => row.sourcePosition),
      [0, 3, 4, 5],
    );
    assert.deepEqual(
      new Set(rows.slice(2).map((row) => row.type)),
      new Set(['Tourist', 'Residence']),
    );
    assert.equal((await request()).body.total, 4);
  },
);

test(
  'a database failure after visa insertion rolls back and returns a generic error',
  sqlTestOptions,
  async (t) => {
    const { pool, prisma, request, seedVisa } = await setup(t);
    const existing = await seedVisa();
    await pool.query(`
    CREATE FUNCTION reject_visa_insert() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      RAISE EXCEPTION 'private database test failure';
    END;
    $$;
    CREATE TRIGGER reject_visa_insert AFTER INSERT ON visas
      FOR EACH ROW EXECUTE FUNCTION reject_visa_insert();
  `);
    const logged = [];
    const logger = t.mock.method(console, 'error', (...args) =>
      logged.push(args),
    );
    const failed = await request(collection, { method: 'POST', body: input });
    assert.equal(failed.status, 500);
    assert.deepEqual(failed.body, { error: 'internal server error' });
    assert.equal(logged.length, 1);
    assert.deepEqual(await prisma.visa.findMany(), [existing]);
    logger.mock.restore();
    await pool.query(
      'DROP TRIGGER reject_visa_insert ON visas; DROP FUNCTION reject_visa_insert()',
    );
    const retried = await request(collection, { method: 'POST', body: input });
    assert.equal(retried.status, 201);
    const rows = await prisma.visa.findMany({
      orderBy: { sourcePosition: 'asc' },
    });
    assert.deepEqual(
      rows.map((row) => row.sourcePosition),
      [0, 1],
    );
  },
);
