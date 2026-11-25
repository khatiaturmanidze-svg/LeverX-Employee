import { verifiedActor } from '../middleware/authorization.js';
import type { RequestHandler } from 'express';
import type {
  ErrorResponse,
  UpdateRequestStatusRequest,
} from '../types/serverTypes.js';
import type { IRequestData } from '../types/employeeTypes.js';
import type { createRequestService } from '../services/requestService.js';

export function createRequestController(
  service: ReturnType<typeof createRequestService>,
) {
  const listRequests: RequestHandler<
    { id: string },
    IRequestData[] | ErrorResponse
  > = async (req, res) => {
    res
      .status(200)
      .json(await service.listRequests(verifiedActor(req), req.params.id));
  };

  const createRequest: RequestHandler<
    { id: string },
    IRequestData | ErrorResponse,
    IRequestData
  > = async (req, res) => {
    res
      .status(201)
      .json(
        await service.createRequest(
          verifiedActor(req),
          req.params.id,
          req.body,
        ),
      );
  };

  const updateRequest: RequestHandler<
    { employeeId: string },
    IRequestData | { message: string } | string,
    UpdateRequestStatusRequest
  > = async (req, res) => {
    res
      .status(200)
      .json(
        await service.updateRequest(
          verifiedActor(req),
          req.params.employeeId,
          req.body,
        ),
      );
  };
  return { listRequests, createRequest, updateRequest };
}
