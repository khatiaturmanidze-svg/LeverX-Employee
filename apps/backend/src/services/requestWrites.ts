import { v4 as uuidv4 } from 'uuid';
import type { PrismaClient } from '../generated/prisma/client.js';
import type { IRequestData } from '../employeeTypes.js';
import { toRequestResponse } from '../mappers/employeeMapper.js';
import { ServiceError } from './serviceError.js';

export async function createEmployeeRequest(
  prisma: PrismaClient,
  employeeId: string,
  input: Pick<IRequestData, 'type' | 'start_date' | 'end_date' | 'note'>,
): Promise<IRequestData> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) throw new ServiceError(401, { error: 'employee not found' });

  const position = await prisma.leaveRequest.aggregate({
    where: { employeeId },
    _min: { sourcePosition: true },
  });
  const request = await prisma.leaveRequest.create({
    data: {
      id: uuidv4(),
      employeeId,
      type: input.type,
      startDate: new Date(`${input.start_date}T00:00:00Z`),
      endDate: new Date(`${input.end_date}T00:00:00Z`),
      note: input.note,
      status: 'pending',
      sourcePosition: (position._min.sourcePosition ?? 0) - 1,
    },
  });
  return toRequestResponse(request);
}

export async function updateEmployeeRequest(
  prisma: PrismaClient,
  employeeId: string,
  requestId: string | number,
  status: IRequestData['status'],
): Promise<IRequestData> {
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ServiceError(400, { error: 'invalid request status' });
  }
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) throw new ServiceError(404, { message: 'Employee not found' });

  const [request] = await prisma.leaveRequest.updateManyAndReturn({
    where: { id: String(requestId), employeeId },
    data: { status },
  });
  if (!request) throw new ServiceError(404, { message: 'Request not found' });
  return toRequestResponse(request);
}
