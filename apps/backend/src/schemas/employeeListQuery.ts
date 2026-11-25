import { z } from 'zod';
import type { EmployeeListQuery } from '../serverTypes.js';
import { ServiceError } from '../services/serviceError.js';

// accept strings such as 1, 2, 20.
// reject 0, -1, 2abc, decimals and arrays.
const positiveInteger = z
  .string()
  .regex(/^[1-9]\d*$/, 'Must be a positive whole number')
  .transform((value) => Number(value))
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER));

const employeeListQuerySchema = z
  .strictObject({
    page: positiveInteger.default(1),

    limit: positiveInteger.pipe(z.number().max(100)).default(20),

    name: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
  })
  .refine(({ page, limit }) => Number.isSafeInteger((page - 1) * limit), {
    path: ['page'],
    message: 'Requested page is too large',
  });

export function parseEmployeeListQuery(query: unknown): EmployeeListQuery {
  const result = employeeListQuerySchema.safeParse(query);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new ServiceError(400, { error: message });
  }

  return result.data;
}
