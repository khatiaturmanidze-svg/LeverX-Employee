import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createTestDatabase, sqlTestOptions } from './helpers/postgres.js';

test(
  'visa date migration preserves identities and UTC calendar dates in different timezones',
  sqlTestOptions,
  async (t) => {
    const fixtures = [
      [Date.parse('2026-10-01T00:00:00Z'), Date.parse('2027-10-01T00:00:00Z')],
      [
        Date.parse('2026-10-01T23:59:59.999Z'),
        Date.parse('2026-10-02T00:00:00.001Z'),
      ],
      [Date.parse('2024-02-29T04:00:00Z'), Date.parse('2024-03-01T00:00:00Z')],
      [-1, 1000],
    ];
    const migration = await readFile(
      new URL(
        '../prisma/migrations/0002_visa_calendar_dates/migration.sql',
        import.meta.url,
      ),
      'utf8',
    );
    for (const timezone of ['UTC', 'Pacific/Honolulu']) {
      await t.test(timezone, async (t) => {
        const { pool, prisma } = await createTestDatabase(t, {
          throughMigration: '0001_initial',
        });
        const client = await pool.connect();
        try {
          await client.query(
            "INSERT INTO employees (id,first_name,last_name,email) VALUES ('employee-a','Example','Employee','example@test.local')",
          );
          const ids = [];
          for (const [index, [start, end]] of fixtures.entries()) {
            const result = await client.query(
              'INSERT INTO visas (employee_id,issuing_country,type,start_date_ms,end_date_ms,source_position) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
              ['employee-a', 'Japanese', 'Work', start, end, index],
            );
            ids.push(result.rows[0].id);
          }
          await client.query("SELECT set_config('TimeZone', $1, false)", [
            timezone,
          ]);
          await client.query(migration);
          const result = await client.query(
            'SELECT id,employee_id,issuing_country,type,start_date::text,end_date::text,source_position FROM visas ORDER BY source_position',
          );
          assert.deepEqual(
            result.rows,
            fixtures.map(([start, end], index) => ({
              id: ids[index],
              employee_id: 'employee-a',
              issuing_country: 'Japanese',
              type: 'Work',
              start_date: new Date(start).toISOString().slice(0, 10),
              end_date: new Date(end).toISOString().slice(0, 10),
              source_position: index,
            })),
          );
          const inserted = await prisma.visa.create({
            data: {
              employeeId: 'employee-a',
              issuing_country: 'Japanese',
              type: 'Work',
              start_date: new Date('2026-10-01T00:00:00Z'),
              end_date: new Date('2027-10-01T00:00:00Z'),
              sourcePosition: fixtures.length,
            },
          });
          assert.ok(inserted.id > BigInt(ids.at(-1)));
          assert.equal(
            inserted.start_date.toISOString(),
            '2026-10-01T00:00:00.000Z',
          );
        } finally {
          client.release();
        }
      });
    }
  },
);
