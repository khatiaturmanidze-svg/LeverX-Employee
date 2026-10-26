import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type {
  SetNewPasswordRequest,
  SetNewPasswordResponse,
  SignInRequest,
  SignUpRequest,
  SignInResponse,
} from '../serverTypes.js';
import { ServiceError } from './serviceError.js';
import type { Pool } from 'pg';
import { createAuthRepository } from '../repositories/authRepository.js';
import {
  createAccount,
  isEmailConflict,
  makeProfile,
} from './accountCreation.js';

export function createAuthService(pool: Pool, token: string) {
  const auth = createAuthRepository(pool);

  async function signIn(body: SignInRequest): Promise<SignInResponse> {
    const normalizedEmail = body.email.trim().toLowerCase();
    const user = await auth.findByEmail(normalizedEmail);
    if (!user) throw new ServiceError(400, { error: 'user not found' });

    const matches = await bcrypt.compare(body.password, user.hashed_password);
    if (!matches) {
      throw new ServiceError(401, { error: 'wrong password' });
    }

    return {
      message: 'signed in!',
      token,
      userId: user.employee_id,
      mustChangePassword: user.must_change_password,
    };
  }

  async function setNewPassword(
    body: SetNewPasswordRequest,
  ): Promise<SetNewPasswordResponse> {
    const { email, newPassword } = body;
    if (!email?.trim() || !newPassword) {
      throw new ServiceError(400, {
        error: 'email and new password are required',
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await auth.findByEmail(normalizedEmail);
    if (!user) throw new ServiceError(404, { error: 'user not found' });
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 13;
    const hash = await bcrypt.hash(newPassword, saltRounds);
    const result = await auth.replaceRequiredPassword(user.employee_id, hash);

    if (!result) {
      throw new ServiceError(400, { error: 'password change is not required' });
    }

    return { message: 'password updated successfully' };
  }

  async function signUp(body: SignUpRequest) {
    if (!body.password)
      throw new ServiceError(400, { error: 'password is required' });
    // Pick explicit form fields so a signup body cannot give itself an Admin role.
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
      const employee = await createAccount(pool, profile, hash, false);
      return {
        message: 'User signed up successfully',
        employee,
        token,
        userId: employee._id,
        mustChangePassword: false,
      };
    } catch (error) {
      if (isEmailConflict(error))
        throw new ServiceError(400, { error: 'email already exists' });
      throw error;
    }
  }
  return { signIn, setNewPassword, signUp };
}
