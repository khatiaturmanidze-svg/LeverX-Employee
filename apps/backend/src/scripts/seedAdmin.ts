import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createPostgresPool } from '../postgres.js';
import { makeProfile, createAccount } from '../services/accountCreation.js';

async function main(): Promise<void> {
  const backendDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..',
  );
  dotenv.config({ path: path.resolve(backendDir, '../../.env'), quiet: true });
  const email = process.env.VITE_TEST_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.VITE_TEST_USER_PASSWORD;
  if (!process.env.DATABASE_URL || !email || !password) {
    throw new Error('DATABASE_URL and both test-admin settings are required');
  }
  const pool = createPostgresPool();
  try {
    const existing = await pool.query<{
      id: string;
      email: string;
      auth_id: string | null;
      auth_email: string | null;
    }>(
      `SELECT e.id, e.email, a.employee_id AS auth_id, a.email AS auth_email
       FROM employees e LEFT JOIN auth_users a ON a.employee_id = e.id
       WHERE lower(trim(e.email)) = $1 OR lower(trim(a.email)) = $1`,
      [email],
    );
    if (existing.rows.length) {
      const row = existing.rows[0];
      if (
        existing.rows.length !== 1 ||
        row.auth_id !== row.id ||
        row.email.trim().toLowerCase() !== email ||
        row.auth_email?.trim().toLowerCase() !== email
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
      {
        email,
        first_name: 'Test',
        last_name: 'Admin',
        role: 'Admin',
      },
      uuidv4(),
    );
    const hash = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 13,
    );
    await createAccount(pool, profile, hash, false);
    console.log('Created development admin');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed');
  process.exitCode = 1;
});
