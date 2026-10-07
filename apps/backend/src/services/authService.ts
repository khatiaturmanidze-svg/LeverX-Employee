import bcrypt from 'bcrypt';
import type {
  IAuthUser,
  SetNewPasswordRequest,
  SetNewPasswordResponse,
  SignInRequest,
  SignUpRequest,
  SignInResponse,
  SignUpResponse,
} from '../serverTypes.js';
import type { IEmployee } from '../employeeTypes.js';
import type { Database } from './types.js';
import { ServiceError } from './serviceError.js';

export function createAuthService(db: Database, token: string) {
  async function signIn(body: SignInRequest): Promise<SignInResponse> {
    const { email, password } = body;

    const user = db.data.authUsers.find((u: IAuthUser) => u.email === email);

    if (!user) {
      throw new ServiceError(400, { error: 'user not found' });
    }

    const isMatch = await bcrypt.compare(password, user.hashed_password);

    if (!isMatch) {
      throw new ServiceError(401, { error: 'wrong password' });
    }

    const employee = db.data.employees.find(
      (e: IEmployee) => e.email === email,
    );
    return {
      message: 'signed in!',
      token,
      userId: employee?._id ?? '',
      mustChangePassword: user.must_change_password ?? false,
    };
  }

  async function setNewPassword(
    body: SetNewPasswordRequest,
  ): Promise<SetNewPasswordResponse> {
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      throw new ServiceError(400, {
        error: 'email and new password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.data.authUsers.find(
      (authUser: IAuthUser) => authUser.email === normalizedEmail,
    );

    if (!user) {
      throw new ServiceError(404, { error: 'user not found' });
    }

    if (!user.must_change_password) {
      throw new ServiceError(400, { error: 'password change is not required' });
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 13;
    user.hashed_password = await bcrypt.hash(newPassword, saltRounds);
    user.must_change_password = false;

    await db.write();

    return { message: 'password updated successfully' };
  }

  async function signUp(body: SignUpRequest): Promise<SignUpResponse> {
    const { first_name, last_name, email, password } = body;

    if (db.data.authUsers.some((u: IAuthUser) => u.email === email)) {
      throw new ServiceError(400, { error: 'email already exists' });
    }
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 13;
    const hashed_password = await bcrypt.hash(password, saltRounds);

    const newAuthUser: IAuthUser = { email, hashed_password };

    const newEmployee: IEmployee = {
      _id: (db.data.employees.length + 1).toString(),
      role: 'Employee',
      first_name,
      last_name,
      email,
      user_avatar: '/users/dumplinh.jpg',
      first_native_name: '',
      middle_native_name: '',
      last_native_name: '',
      department: '',
      building: '',
      room: '0',
      desk_number: 0,
      isRemoteWork: false,
      phone: '',
      zoom_id: '',
      zoom_link: '',
      citizenship: '',
      date_birth: { year: null, month: null, day: null },
      manager: { id: '', first_name: '', last_name: '' },
      visa: [],
      requests: [],
    };

    db.data.authUsers.push(newAuthUser);
    db.data.employees.push(newEmployee);
    await db.write();

    return { message: 'User signed up successfully', employee: newEmployee };
  }
  return { signIn, setNewPassword, signUp };
}
