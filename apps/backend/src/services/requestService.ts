import type { UpdateRequestStatusRequest } from '../serverTypes.js';
import type { IRequestData } from '../employeeTypes.js';
import { ServiceError } from './serviceError.js';
import type { Repositories } from '../repositories/index.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import {
  createEmployeeRequest,
  updateEmployeeRequest,
} from './requestWrites.js';

export function createRequestService(
  prisma: PrismaClient,
  repositories: Repositories,
) {
  // GET /requests/:id; the URL ID identifies the employee.
  async function listRequests(id: string): Promise<IRequestData[]> {
    const employee = await repositories.employees.findIdentity(id);

    if (!employee) {
      throw new ServiceError(401, { error: 'employee not found' });
    }

    return repositories.requests.listByEmployeeId(id);
  }

  async function createRequest(
    id: string,
    body: IRequestData,
  ): Promise<IRequestData> {
    return createEmployeeRequest(prisma, id, body);
  }

  async function updateRequest(
    employeeId: string,
    body: UpdateRequestStatusRequest,
  ): Promise<IRequestData> {
    return updateEmployeeRequest(
      prisma,
      employeeId,
      body.requestId,
      body.newStatus,
    );
  }
  return { listRequests, createRequest, updateRequest };
}
