import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createApp } from '../dist/app.js';
import { createTestDatabase, sqlTestOptions } from './helpers/postgres.js';

test(
  'visa CRUD keeps the contract and employee scope',
  sqlTestOptions,
  async (t) => {
    const { prisma } = await createTestDatabase(t);
    await prisma.employee.createMany({
      data: [
        {
          id: 'employee-a',
          firstName: 'A',
          lastName: 'Test',
          email: 'a@example.test',
        },
        {
          id: 'employee-b',
          firstName: 'B',
          lastName: 'Test',
          email: 'b@example.test',
        },
      ],
    });
    const foreign = await prisma.visa.create({
      data: {
        employeeId: 'employee-b',
        issuing_country: 'Japanese',
        type: 'Work',
        start_date: new Date('2026-10-01T00:00:00Z'),
        end_date: new Date('2027-10-01T00:00:00Z'),
        sourcePosition: 0,
      },
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
      path,
      { method = 'GET', body, rawBody, token = 'test-token' } = {},
    ) {
      const headers = {};
      if (token) headers.authorization = token;
      if (body !== undefined || rawBody !== undefined) {
        headers['content-type'] = 'application/json';
      }
      const response = await fetch(
        `http://127.0.0.1:${server.address().port}${path}`,
        {
          method,
          headers,
          body:
            rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
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

    const collection = '/employees/employee-a/visas';
    const input = {
      issuing_country: ' Japanese ',
      type: 'Work',
      start_date: '2026-10-01',
      end_date: '2027-10-01',
    };

    const created = await request(collection, { method: 'POST', body: input });
    assert.equal(created.status, 201);
    assert.match(created.body.id, /^[1-9]\d*$/);
    assert.deepEqual(created.body, {
      ...input,
      issuing_country: 'Japanese',
      id: created.body.id,
      employeeId: 'employee-a',
    });
    const item = `${collection}/${created.body.id}`;

    assert.deepEqual((await request(item)).body, created.body);
    const page = await request(
      `${collection}?page=1&limit=2&issuing_country=japanese`,
    );
    assert.equal(page.status, 200);
    assert.deepEqual(page.body, {
      items: [created.body],
      total: 1,
      page: 1,
      limit: 2,
    });

    const patched = await request(item, {
      method: 'PATCH',
      body: { type: 'Tourist' },
    });
    assert.equal(patched.status, 200);
    assert.deepEqual(patched.body, { ...created.body, type: 'Tourist' });

    const invalid = await request(item, {
      method: 'PATCH',
      body: { start_date: '2028-10-01' },
    });
    assert.equal(invalid.status, 400);
    assert.deepEqual((await request(item)).body, patched.body);

    for (const method of ['GET', 'PATCH', 'DELETE']) {
      const response = await request(`${collection}/${foreign.id}`, {
        method,
        ...(method === 'PATCH' ? { body: { type: 'Changed' } } : {}),
      });
      assert.equal(response.status, 404);
    }
    assert.equal(
      (
        await prisma.visa.findUnique({
          where: { id: foreign.id },
        })
      ).type,
      'Work',
    );

    const deleted = await request(item, { method: 'DELETE' });
    assert.equal(deleted.status, 204);
    assert.equal(deleted.text, '');
    assert.equal((await request(item)).status, 404);
  },
);
