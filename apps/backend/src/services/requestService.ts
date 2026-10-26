import type { UpdateRequestStatusRequest } from '../serverTypes.js';
import type { IRequestData } from '../employeeTypes.js';
import { ServiceError } from './serviceError.js';
import type { Repositories } from '../repositories/index.js';
import type { Pool } from 'pg';
import { createRequestSql, updateRequestSql } from './requestWritesSql.js';

export function createRequestService(pool: Pool, repositories: Repositories) {
  // GET /requests/:id; the URL ID identifies the employee.
  async function listRequests(id: string): Promise<IRequestData[]> {
    const employee = await repositories.employees.findById(id);

    if (!employee) {
      throw new ServiceError(401, { error: 'employee not found' });
    }

    return repositories.requests.listByEmployeeId(id);
  }

  async function createRequest(
    id: string,
    body: IRequestData,
  ): Promise<IRequestData> {
    return createRequestSql(pool, id, body);
  }

  async function updateRequest(
    employeeId: string,
    body: UpdateRequestStatusRequest,
  ): Promise<IRequestData> {
    return updateRequestSql(pool, employeeId, body.requestId, body.newStatus);
  }
  return { listRequests, createRequest, updateRequest };
}
