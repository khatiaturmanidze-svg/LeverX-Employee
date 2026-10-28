import type { PrismaClient } from '../generated/prisma/client.js';
import { toVisaResponse } from '../mappers/employeeMapper.js';

export function createVisaRepository(prisma: PrismaClient) {
  async function listByEmployeeId(id: string) {
    const visas = await prisma.visa.findMany({
      where: { employeeId: id },
      orderBy: [{ sourcePosition: 'asc' }, { id: 'asc' }],
    });
    return visas.map(toVisaResponse);
  }

  return { listByEmployeeId };
}
