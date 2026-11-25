import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type {
  SetNewPasswordRequest,
  SignInRequest,
  SignUpRequest,
} from '../types/serverTypes.js';
import { ServiceError } from './serviceError.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import { createAuthRepository } from '../repositories/authRepository.js';
import type { VerifiedUser } from '../types/auth.js';
import { validatePassword } from './password.js';
import {
  createAccount,
  isEmailConflict,
  makeProfile,
} from './accountCreation.js';

type VerifiedLogin = {
  employeeId: string;
  sessionVersion: number;
  mustChangePassword: boolean;
};

const DUMMY_HASH =
  '$2b$13$FczKwu6okJoEh54aOY/YgeqVsXNM2kcC1w4IqjebQgzLV1QBM0NBa';

function validateIdentity(body: SignInRequest) {
  if (
    typeof body?.email !== 'string' ||
    body.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
    typeof body.password !== 'string' ||
    !body.password ||
    Buffer.byteLength(body.password) > 72 ||
    (body.rememberMe !== undefined && typeof body.rememberMe !== 'boolean')
  ) {
    throw new ServiceError(400, { error: 'Invalid authentication request' });
  }
}

export function createAuthService(prisma: PrismaClient) {
  const auth = createAuthRepository(prisma);

  async function signIn(body: SignInRequest): Promise<VerifiedLogin> {
    validateIdentity(body);
    const normalizedEmail = body.email.trim().toLowerCase();
    const user = await auth.findByEmail(normalizedEmail);

    const matches = await bcrypt.compare(
      body.password,
      user?.hashedPassword ?? DUMMY_HASH,
    );

    if (!user || !matches) {
      throw new ServiceError(401, {
        error: 'Invalid email or password',
      });
    }

    return {
      employeeId: user.employeeId,
      sessionVersion: user.sessionVersion,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async function setNewPassword(
    actor: VerifiedUser,
    body: SetNewPasswordRequest,
  ) {
    if (!body || Object.keys(body).some((key) => key !== 'newPassword')) {
      throw new ServiceError(400, {
        error: 'Submit only newPassword; the session identifies your account',
      });
    }
    validatePassword(body.newPassword);
    if (!actor.mustChangePassword)
      throw new ServiceError(400, { error: 'password change is not required' });
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 13;
    const hash = await bcrypt.hash(body.newPassword, saltRounds);
    return prisma.$transaction(async (tx) => {
      const changed = await tx.authUser.updateMany({
        where: {
          employeeId: actor.id,
          sessionVersion: actor.sessionVersion,
          mustChangePassword: true,
        },
        data: {
          hashedPassword: hash,
          mustChangePassword: false,
          sessionVersion: { increment: 1 },
        },
      });
      if (changed.count !== 1)
        throw new ServiceError(409, {
          error: 'Account state changed; sign in again',
        });
      return { employeeId: actor.id, sessionVersion: actor.sessionVersion + 1 };
    });
  }

  async function signUp(body: SignUpRequest) {
    validateIdentity(body);
    validatePassword(body.password);
    if (
      Object.keys(body).some(
        (key) =>
          ![
            'email',
            'password',
            'first_name',
            'last_name',
            'rememberMe',
          ].includes(key),
      )
    ) {
      throw new ServiceError(400, { error: 'Unsupported signup field' });
    }
    if (
      typeof body.first_name !== 'string' ||
      typeof body.last_name !== 'string' ||
      body.first_name.length > 100 ||
      body.last_name.length > 100
    ) {
      throw new ServiceError(400, { error: 'Invalid name' });
    }
    const profile = makeProfile(
      {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        desk_number: 0, // Preserve the current self-sign-up default.
      },
      uuidv4(),
    );
    const hash = await bcrypt.hash(
      body.password,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 13,
    );
    try {
      const employee = await createAccount(prisma, profile, hash, false);
      const account = await prisma.authUser.findUniqueOrThrow({
        where: { employeeId: employee._id },
        select: {
          employeeId: true,
          sessionVersion: true,
          mustChangePassword: true,
        },
      });
      return {
        employee,
        ...account,
      };
    } catch (error) {
      if (isEmailConflict(error))
        throw new ServiceError(400, { error: 'email already exists' });
      throw error;
    }
  }
  return { signIn, setNewPassword, signUp };
}
