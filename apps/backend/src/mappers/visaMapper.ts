import type { Visa as PrismaVisa } from '../generated/prisma/client.js';
import type { Visa } from '../visaTypes.js';

export function toVisaResponse(visa: PrismaVisa): Visa {
  return {
    id: visa.id.toString(),
    employeeId: visa.employeeId,
    issuing_country: visa.issuing_country,
    type: visa.type,
    start_date: visa.start_date.toISOString().slice(0, 10),
    end_date: visa.end_date.toISOString().slice(0, 10),
  };
}

export function toStoredDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}
