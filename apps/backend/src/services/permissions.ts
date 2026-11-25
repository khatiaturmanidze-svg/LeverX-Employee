import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import type { VerifiedUser } from '../types/auth.js';
import { ServiceError } from './serviceError.js';

export const ROLES = ['Employee', 'HR', 'Admin'] as const;

export function requireAdmin(actor: VerifiedUser) {
  if (actor.role !== 'Admin')
    throw new ServiceError(403, { error: 'Admin access required' });
}

// Call inside write transactions as well as at the HTTP boundary. Roles and
// account versions can change after the request's initial authentication check.
export async function currentActor(
  db: Prisma.TransactionClient | PrismaClient,
  actor: VerifiedUser,
) {
  const account = await db.authUser.findUnique({
    where: { employeeId: actor.id },
    select: {
      sessionVersion: true,
      mustChangePassword: true,
      employee: { select: { role: true } },
    },
  });
  if (!account || account.sessionVersion !== actor.sessionVersion) {
    throw new ServiceError(401, { error: 'Sign in required' });
  }
  if (account.mustChangePassword) {
    throw new ServiceError(403, {
      error: 'Replace your temporary password before continuing',
      code: 'PASSWORD_CHANGE_REQUIRED',
    });
  }
  return { ...actor, role: account.employee.role };
}

export async function authorizeEmployee(
  db: Prisma.TransactionClient | PrismaClient,
  actor: VerifiedUser,
  employeeId: string,
  action: 'read' | 'edit' | 'approve' = 'read',
) {
  const target = await db.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, managerId: true },
  });
  if (!target) throw new ServiceError(404, { error: 'employee not found' });
  const owner = actor.id === target.id;
  const manager = actor.id === target.managerId;
  const allowed =
    action === 'approve'
      ? !owner && (actor.role === 'Admin' || manager)
      : actor.role === 'Admin' || manager || (action === 'read' && owner);
  if (!allowed)
    throw new ServiceError(403, {
      error: 'You do not have permission to access this employee',
    });
  return target;
}
