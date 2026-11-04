import { z } from 'zod';
import { ServiceError } from '../services/serviceError.js';

const visaDateSchema = z.iso.date().refine((value) => value >= '0001-01-01', {
  message: 'Year must be between 0001 and 9999',
});

const visaFieldsSchema = z.strictObject({
  issuing_country: z.string().trim().min(1, 'country is required'),
  type: z.string().trim().min(1, 'type is required'),
  start_date: visaDateSchema,
  end_date: visaDateSchema,
});

export const createVisaSchema = visaFieldsSchema.refine(
  (visa) => visa.end_date >= visa.start_date,
  { message: 'End date must be on or after start date', path: ['end_date'] },
);

export const patchVisaSchema = visaFieldsSchema
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: 'At least one visa field is required',
  });

const employeeVisasSchema = z.array(createVisaSchema);

export function parseEmployeeVisas(value: unknown) {
  const result = employeeVisasSchema.safeParse(value);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `visa.${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new ServiceError(400, { error: message });
  }
  return result.data;
}

const employeeVisaParamsSchema = z.strictObject({
  employeeId: z.string().trim().min(1, 'employeeId is required'),
});

const visaIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'visaId must be a positive integer')
  .transform((value) => BigInt(value))
  .pipe(z.bigint().max(9223372036854775807n));

const visaItemParamsSchema = employeeVisaParamsSchema.extend({
  visaId: visaIdSchema,
});

const positiveIntegerQuery = z
  .string()
  .regex(/^[1-9]\d*$/, 'Must be a positive whole number')
  .transform((value) => Number(value))
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER));

const visaListQuerySchema = z
  .strictObject({
    page: positiveIntegerQuery.default(1),
    limit: positiveIntegerQuery.pipe(z.number().max(100)).default(20),
    issuing_country: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
  })
  .refine(
    ({ page, limit }) => {
      const offset = (page - 1) * limit;
      return Number.isSafeInteger(offset) && offset <= 2_147_483_647;
    },
    { path: ['page'], message: 'Requested page is too large' },
  );

function parseInput<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`)
      .join('; ');
    throw new ServiceError(400, { error: message });
  }
  return result.data;
}

export function parseEmployeeVisaParams(value: unknown) {
  return parseInput(employeeVisaParamsSchema, value);
}

export function parseVisaItemParams(value: unknown) {
  return parseInput(visaItemParamsSchema, value);
}

export function parseVisaListQuery(value: unknown) {
  return parseInput(visaListQuerySchema, value);
}

export function parseCreateVisa(value: unknown) {
  return parseInput(createVisaSchema, value);
}

export function parsePatchVisa(value: unknown) {
  return parseInput(patchVisaSchema, value);
}
