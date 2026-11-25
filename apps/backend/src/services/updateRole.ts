import type { PrismaClient } from '../generated/prisma/client.js';
import type { IEmployee } from '../types/employeeTypes.js';
import { ServiceError } from './serviceError.js';
import type { VerifiedUser } from '../types/auth.js';
import { currentActor, requireAdmin, ROLES } from './permissions.js';

export async function updateEmployeeRole(
  prisma: PrismaClient,
  id: string,
  newRole: string,
  readEmployee: (id: string) => Promise<IEmployee>,
  actor: VerifiedUser,
) {
  if (!ROLES.includes(newRole as (typeof ROLES)[number])) {
    throw new ServiceError(400, { error: 'Invalid employee role' });
  }
  const result = await prisma.$transaction(async (tx) => {
    requireAdmin(await currentActor(tx, actor));
    return tx.employee.updateMany({ where: { id }, data: { role: newRole } });
  });
  if (!result.count) {
    throw new ServiceError(404, { error: 'Employee not found.' });
  }
  return {
    message: 'Role updated successfully',
    employee: await readEmployee(id),
  };
}
