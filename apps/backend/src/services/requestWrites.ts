import { v4 as uuidv4 } from 'uuid';
import type { PrismaClient } from '../generated/prisma/client.js';
import type { IRequestData } from '../types/employeeTypes.js';
import { toRequestResponse } from '../mappers/employeeMapper.js';
import { ServiceError } from './serviceError.js';
import type { VerifiedUser } from '../types/auth.js';
import { authorizeEmployee, currentActor } from './permissions.js';

export async function createEmployeeRequest(
  prisma: PrismaClient,
  employeeId: string,
  input: Pick<IRequestData, 'type' | 'start_date' | 'end_date' | 'note'>,
): Promise<IRequestData> {
  if (
    !input ||
    typeof input.type !== 'string' ||
    !input.type.trim() ||
    input.type.length > 100 ||
    typeof input.note !== 'string' ||
    input.note.length > 4000 ||
    ![input.start_date, input.end_date].every(
      (date) =>
        typeof date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isFinite(Date.parse(`${date}T00:00:00Z`)) &&
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date,
    ) ||
    input.end_date < input.start_date
  ) {
    throw new ServiceError(400, { error: 'Invalid leave request' });
  }
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) throw new ServiceError(404, { error: 'employee not found' });

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
  actor: VerifiedUser,
): Promise<IRequestData> {
  if (!['approved', 'rejected'].includes(status)) {
    throw new ServiceError(400, { error: 'invalid request status' });
  }
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) throw new ServiceError(404, { message: 'Employee not found' });

  const request = await prisma.$transaction(async (tx) => {
    await authorizeEmployee(
      tx,
      await currentActor(tx, actor),
      employeeId,
      'approve',
    );
    const [updated] = await tx.leaveRequest.updateManyAndReturn({
      where: { id: String(requestId), employeeId, status: 'pending' },
      data: { status },
    });
    return updated;
  });
  if (!request) throw new ServiceError(404, { message: 'Request not found' });
  return toRequestResponse(request);
}
