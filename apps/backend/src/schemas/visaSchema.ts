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
