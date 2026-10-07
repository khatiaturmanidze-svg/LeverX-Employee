import { v4 as uuidv4 } from 'uuid';
import type { UpdateRequestStatusRequest } from '../serverTypes.js';
import type { IRequestData } from '../employeeTypes.js';
import type { Database } from './types.js';
import { ServiceError } from './serviceError.js';

export function createRequestService(db: Database) {
  async function listRequests(id: string): Promise<IRequestData[]> {
    const employee = db.data.employees.find((emp) => emp._id === id);

    if (!employee) {
      throw new ServiceError(401, { error: 'employee not found' });
    }

    return employee.requests;
  }

  async function createRequest(
    id: string,
    body: IRequestData,
  ): Promise<IRequestData> {
    const newRequest = body;

    const employee = db.data.employees.find((emp) => emp._id === id);

    if (!employee) {
      throw new ServiceError(401, { error: 'employee not found' });
    }

    const finalizedRequest: IRequestData = {
      ...newRequest,
      employeeId: id,
      id: uuidv4(),
      status: 'pending',
    };

    employee.requests.unshift(finalizedRequest);

    await db.write();

    return finalizedRequest;
  }

  async function updateRequest(
    employeeId: string,
    body: UpdateRequestStatusRequest,
  ): Promise<IRequestData> {
    const { requestId, newStatus } = body;

    if (!db.data) throw new ServiceError(500, 'Database not loaded');

    const employee = db.data.employees.find((emp) => emp._id === employeeId);

    if (!employee) {
      throw new ServiceError(404, { message: 'Employee not found' });
    }

    const request = employee.requests.find(
      (r) => String(r.id) === String(requestId),
    );
    if (!request) {
      throw new ServiceError(404, { message: 'Request not found' });
    }

    request.status = newStatus;
    await db.write();
    return request;
  }
  return { listRequests, createRequest, updateRequest };
}
