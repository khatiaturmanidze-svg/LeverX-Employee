import type { Prisma, PrismaClient } from '../generated/prisma/client.js';

export const employeeRelations = {
  manager: { select: { id: true, firstName: true, lastName: true } },
  visas: { orderBy: [{ sourcePosition: 'asc' }, { id: 'asc' }] },
  requests: { orderBy: [{ sourcePosition: 'asc' }, { id: 'asc' }] },
} satisfies Prisma.EmployeeInclude;

export type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: typeof employeeRelations;
}>;

export function createEmployeeRepository(prisma: PrismaClient) {
  function findIdentity(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      select: { id: true, firstName: true, email: true },
    });
  }

  function listAll() {
    return prisma.employee.findMany({
      include: employeeRelations,
      orderBy: [{ sourcePosition: 'asc' }, { id: 'asc' }],
    });
  }

  function findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: employeeRelations,
    });
  }

  return { findIdentity, findById, listAll };
}
