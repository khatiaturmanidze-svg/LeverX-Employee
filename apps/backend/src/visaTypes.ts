import type { z } from 'zod';
import type {
  createVisaSchema,
  patchVisaSchema,
} from './schemas/visaSchema.js';

export type CreateVisaInput = z.infer<typeof createVisaSchema>;
export type UpdateVisaInput = z.infer<typeof patchVisaSchema>;

export interface Visa extends CreateVisaInput {
  id: string;
  employeeId: string;
}

export interface VisaListQuery {
  page: number;
  limit: number;
  issuing_country?: string;
}

export interface VisaPage {
  items: Visa[];
  total: number;
  page: number;
  limit: number;
}
