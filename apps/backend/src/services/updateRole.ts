import type { PrismaClient } from '../generated/prisma/client.js';
import type { IEmployee } from '../employeeTypes.js';
import { ServiceError } from './serviceError.js';

export async function updateEmployeeRole(
  prisma: PrismaClient,
  id: string,
  newRole: string,
  readEmployee: (id: string) => Promise<IEmployee>,
) {
  const result = await prisma.employee.updateMany({
    where: { id },
    data: { role: newRole },
  });
  if (!result.count) {
    throw new ServiceError(404, { error: 'Employee not found.' });
  }
  return {
    message: 'Role updated successfully',
    employee: await readEmployee(id),
  };
}
