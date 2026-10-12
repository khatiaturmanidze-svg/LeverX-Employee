import type { RequestHandler } from 'express';

import { IVisa } from '../employeeTypes.js';
import { ErrorResponse } from '../serverTypes.js';
import { createVisaService } from '../services/visaService.js';
export function createVisaController(
  service: ReturnType<typeof createVisaService>,
) {
  const listVisas: RequestHandler<
    { id: string },
    IVisa[] | ErrorResponse
  > = async (req, res) => {
    res.status(200).json(await service.listVisas(req.params.id));
  };

  return { listVisas };
}
