import { verifiedActor } from '../middleware/authorization.js';
import type { RequestHandler } from 'express';
import type { Visa, VisaPage } from '../types/visaTypes.js';
import type { ErrorResponse } from '../types/serverTypes.js';
import type { createVisaService } from '../services/visaService.js';
import {
  parseCreateVisa,
  parseEmployeeVisaParams,
  parsePatchVisa,
  parseVisaItemParams,
  parseVisaListQuery,
} from '../schemas/visaSchema.js';

export function createVisaController(
  service: ReturnType<typeof createVisaService>,
) {
  const listVisas: RequestHandler<
    { employeeId: string },
    VisaPage | ErrorResponse
  > = async (req, res) => {
    const { employeeId } = parseEmployeeVisaParams(req.params);
    const query = parseVisaListQuery(req.query);
    res
      .status(200)
      .json(await service.listVisas(verifiedActor(req), employeeId, query));
  };

  const getVisa: RequestHandler<
    { employeeId: string; visaId: string },
    Visa | ErrorResponse
  > = async (req, res) => {
    const { employeeId, visaId } = parseVisaItemParams(req.params);
    res
      .status(200)
      .json(await service.getVisa(verifiedActor(req), employeeId, visaId));
  };

  const createVisa: RequestHandler<
    { employeeId: string },
    Visa | ErrorResponse,
    unknown
  > = async (req, res) => {
    const { employeeId } = parseEmployeeVisaParams(req.params);
    const input = parseCreateVisa(req.body);
    res
      .status(201)
      .json(await service.createVisa(verifiedActor(req), employeeId, input));
  };

  const updateVisa: RequestHandler<
    { employeeId: string; visaId: string },
    Visa | ErrorResponse,
    unknown
  > = async (req, res) => {
    const { employeeId, visaId } = parseVisaItemParams(req.params);
    const patch = parsePatchVisa(req.body);
    res
      .status(200)
      .json(
        await service.updateVisa(verifiedActor(req), employeeId, visaId, patch),
      );
  };

  const deleteVisa: RequestHandler<{
    employeeId: string;
    visaId: string;
  }> = async (req, res) => {
    const { employeeId, visaId } = parseVisaItemParams(req.params);
    await service.deleteVisa(verifiedActor(req), employeeId, visaId);
    res.status(204).end();
  };

  return { listVisas, getVisa, createVisa, updateVisa, deleteVisa };
}
