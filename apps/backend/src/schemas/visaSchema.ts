import { z } from 'zod';

/**
 * 
 *   "issuing_country": "Japanese",
          "type": "National visa type D",
          "start_date": 1652158800000,
          "end_date": 1683608400000
 */
export const createVisaSchema = z
  .strictObject({
    issuing_country: z.string().trim().min(1, 'country is required'),
    type: z.string().trim().min(1, 'type is required'),
    start_date: z.iso.date(),
    end_date: z.iso.date(),
  })
  .refine((visa) => visa.end_date >= visa.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });
