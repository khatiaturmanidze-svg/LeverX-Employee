import type { UpdateRequestStatusRequest } from '../types/serverTypes.js';
import type { IRequestData } from '../types/employeeTypes.js';
import { ServiceError } from './serviceError.js';
import type { Repositories } from '../repositories/index.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import type { VerifiedUser } from '../types/auth.js';
import { authorizeEmployee } from './permissions.js';
import {
  createEmployeeRequest,
  updateEmployeeRequest,
} from './requestWrites.js';

export function createRequestService(
  prisma: PrismaClient,
  repositories: Repositories,
) {
  // GET /requests/:id; the URL ID identifies the employee.
  async function listRequests(
    actor: VerifiedUser,
    id: string,
  ): Promise<IRequestData[]> {
    await authorizeEmployee(prisma, actor, id);
    const employee = await repositories.employees.findIdentity(id);

    if (!employee) {
      throw new ServiceError(404, { error: 'employee not found' });
    }

    return repositories.requests.listByEmployeeId(id);
  }

  async function createRequest(
    actor: VerifiedUser,
    id: string,
    body: IRequestData,
  ): Promise<IRequestData> {
    if (
      id !== actor.id ||
      (body.employeeId !== undefined && body.employeeId !== actor.id)
    ) {
      throw new ServiceError(403, {
        error: 'You can only create your own leave requests',
      });
    }
    return createEmployeeRequest(prisma, actor.id, body);
  }

  async function updateRequest(
    actor: VerifiedUser,
    employeeId: string,
    body: UpdateRequestStatusRequest,
  ): Promise<IRequestData> {
    return updateEmployeeRequest(
      prisma,
      employeeId,
      body.requestId,
      body.newStatus,
      actor,
    );
  }
  return { listRequests, createRequest, updateRequest };
}
