import type {
  AuthUser,
  Prisma,
  PrismaClient,
} from '../generated/prisma/client.js';

export type AuthRow = AuthUser;

export function createAuthRepository(prisma: PrismaClient) {
  function findByEmail(email: string) {
    return prisma.authUser.findUnique({ where: { email } });
  }

  function insertAuthUser(row: AuthRow, tx: Prisma.TransactionClient = prisma) {
    return tx.authUser.create({ data: row });
  }

  async function replaceRequiredPassword(id: string, hash: string) {
    const result = await prisma.authUser.updateMany({
      where: { employeeId: id, mustChangePassword: true },
      data: { hashedPassword: hash, mustChangePassword: false },
    });
    return result.count === 1;
  }

  return { findByEmail, insertAuthUser, replaceRequiredPassword };
}
