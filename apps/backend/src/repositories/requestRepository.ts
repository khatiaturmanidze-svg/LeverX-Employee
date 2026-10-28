import type { PrismaClient } from '../generated/prisma/client.js';
import { toRequestResponse } from '../mappers/employeeMapper.js';

export function createRequestRepository(prisma: PrismaClient) {
  async function listByEmployeeId(id: string) {
    const requests = await prisma.leaveRequest.findMany({
      where: { employeeId: id },
      orderBy: [{ sourcePosition: 'asc' }, { id: 'asc' }],
    });
    return requests.map(toRequestResponse);
  }

  return { listByEmployeeId };
}
