import type { CreateVisaInput } from '@/types/type';

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function validateVisaInputs(
  visas: CreateVisaInput[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  visas.forEach((visa, index) => {
    const prefix = `visa_${index}`;
    if (!visa.issuing_country.trim()) errors[`${prefix}_country`] = 'Required';
    if (!visa.type.trim()) errors[`${prefix}_type`] = 'Required';
    const validStart = isCalendarDate(visa.start_date);
    const validEnd = isCalendarDate(visa.end_date);
    if (!validStart)
      errors[`${prefix}_start_date`] = 'Enter a valid YYYY-MM-DD date';
    if (!validEnd)
      errors[`${prefix}_end_date`] = 'Enter a valid YYYY-MM-DD date';
    if (validStart && validEnd && visa.end_date < visa.start_date) {
      errors[`${prefix}_end_date`] = 'End date must be on or after start date';
    }
  });
  return errors;
}

export function toVisaInput(visa: CreateVisaInput): CreateVisaInput {
  return {
    issuing_country: visa.issuing_country.trim(),
    type: visa.type.trim(),
    start_date: visa.start_date,
    end_date: visa.end_date,
  };
}
