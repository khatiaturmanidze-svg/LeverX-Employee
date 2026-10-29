import assert from 'node:assert/strict';
import test from 'node:test';
import { toStoredDate, toVisaResponse } from '../dist/mappers/visaMapper.js';
import { parseEmployeeVisas } from '../dist/schemas/visaSchema.js';
import { makeProfile } from '../dist/services/accountCreation.js';

const input = {
  issuing_country: ' Japanese ',
  type: ' Work ',
  start_date: '2024-02-29',
  end_date: '2027-10-01',
};

test('saved visa responses serialize IDs without precision loss and return calendar dates', () => {
  const visa = toVisaResponse({
    id: 9007199254740993n,
    employeeId: 'employee-a',
    issuing_country: 'Japanese',
    type: 'Work',
    start_date: toStoredDate(input.start_date),
    end_date: toStoredDate(input.end_date),
    sourcePosition: 0,
  });
  assert.deepEqual(JSON.parse(JSON.stringify(visa)), {
    id: '9007199254740993',
    employeeId: 'employee-a',
    ...input,
    issuing_country: 'Japanese',
    type: 'Work',
  });
  assert.equal(
    toStoredDate(input.start_date).toISOString(),
    '2024-02-29T00:00:00.000Z',
  );
});

test('employee visa inputs trim strings and require date-only editable fields', () => {
  assert.deepEqual(parseEmployeeVisas([input]), [
    { ...input, issuing_country: 'Japanese', type: 'Work' },
  ]);
  assert.deepEqual(parseEmployeeVisas([]), []);
  for (const invalid of [
    null,
    {},
    [null],
    [{ ...input, start_date: 0 }],
    [{ ...input, start_date: '2026-02-30' }],
    [{ ...input, start_date: '0000-01-01' }],
    [{ ...input, start_date: '2028-01-01' }],
    [{ ...input, start_date: '2024-02-29T00:00:00Z' }],
    [{ ...input, id: '12' }],
    [{ ...input, employeeId: 'other' }],
  ]) {
    assert.throws(
      () => parseEmployeeVisas(invalid),
      (error) => error.status === 400,
    );
  }
});

test('new employee profiles accept unsaved visas without assigning response IDs', () => {
  const profile = makeProfile(
    {
      first_name: 'Example',
      last_name: 'Employee',
      email: 'example@test.local',
      visa: [input],
    },
    'employee-a',
  );
  assert.deepEqual(profile.visa, parseEmployeeVisas([input]));
  assert.equal('id' in profile.visa[0], false);
  assert.throws(
    () =>
      makeProfile(
        {
          first_name: 'Example',
          last_name: 'Employee',
          email: 'example@test.local',
          visa: null,
        },
        'employee-a',
      ),
    (error) => error.status === 400,
  );
});
