import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createPrismaClient } from '../prisma.js';
import { makeProfile, createAccount } from '../services/accountCreation.js';

async function main(): Promise<void> {
  const backendDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..',
  );
  dotenv.config({ path: path.resolve(backendDir, '../../.env'), quiet: true });
  const email = process.env.VITE_TEST_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.VITE_TEST_USER_PASSWORD;
  if (!email || !password)
    throw new Error('Both test-admin settings are required');

  const prisma = createPrismaClient();
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        email: true,
        authUser: { select: { employeeId: true, email: true } },
      },
    });
    const existing = employees.filter(
      (employee) =>
        employee.email.trim().toLowerCase() === email ||
        employee.authUser?.email.trim().toLowerCase() === email,
    );
    if (existing.length) {
      const employee = existing[0];
      if (
        existing.length !== 1 ||
        employee.authUser?.employeeId !== employee.id ||
        employee.email.trim().toLowerCase() !== email ||
        employee.authUser.email.trim().toLowerCase() !== email
      ) {
        throw new Error(
          'Existing account is inconsistent; repair it before seeding',
        );
      }
      console.log(
        'Account already exists; left its role, ID, and password unchanged',
      );
      return;
    }

    const profile = makeProfile(
      { email, first_name: 'Test', last_name: 'Admin', role: 'Admin' },
      uuidv4(),
    );
    const hash = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 13,
    );
    await createAccount(prisma, profile, hash, false);
    console.log('Created development admin');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed');
  process.exitCode = 1;
});
