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

  return { findByEmail, insertAuthUser };
}
