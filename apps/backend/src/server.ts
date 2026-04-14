import bcrypt from 'bcrypt';
import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import type {
  IAuthUser,
  CreateUserRequest,
  CreateUserResponse,
  SignInRequest,
  SignUpRequest,
  UpdateRoleRequest,
  SignInResponse,
  SignUpResponse,
  ErrorResponse,
  UpdateRoleResponse,
} from './serverTypes.js';
import type { IEmployee, IRequestData } from './employeeTypes.js';
import { initDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

const db = await initDatabase();
const DUMMY_TOKEN = process.env.VITE_AUTH_TOKEN || 'secret-token';

function generateTemporaryPassword(length = 12): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');
}

function authMiddleware(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction,
): void {
  const token = req.headers['authorization'];

  if (!token) {
    res.status(401).json({ error: 'not authorized' });
    return;
  }

  if (token !== DUMMY_TOKEN) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }

  next();
}

app.post<Record<string, never>, SignInResponse | ErrorResponse, SignInRequest>(
  '/sign-in',
  async (
    req: Request<
      Record<string, never>,
      SignInResponse | ErrorResponse,
      SignInRequest
    >,
    res,
  ) => {
    const { email, password } = req.body;

    const user = db.data.authUsers.find((u: IAuthUser) => u.email === email);

    if (!user) {
      res.status(400).json({ error: 'user not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.hashed_password);

    if (!isMatch) {
      res.status(401).json({ error: 'wrong password' });
      return;
    }

    const employee = db.data.employees.find(
      (e: IEmployee) => e.email === email,
    );
    res.json({
      message: 'signed in!',
      token: DUMMY_TOKEN,
      userId: employee?._id ?? '',
    });
  },
);

app.get<Record<string, never>, IEmployee[] | ErrorResponse>(
  '/users',
  authMiddleware,
  async (req, res) => {
    res.json(db.data.employees);
  },
);

app.get<{ id: string }, IEmployee | ErrorResponse>(
  '/users/:id',
  authMiddleware,
  async (req, res) => {
    const user = db.data.employees.find(
      (u: IEmployee) => u._id === req.params.id,
    );

    if (!user) {
      res.status(400).json({ error: 'user not found' });
      return;
    }

    res.json(user);
  },
);

app.post<Record<string, never>, SignUpResponse | ErrorResponse, SignUpRequest>(
  '/sign-up',
  async (
    req: Request<
      Record<string, never>,
      SignUpResponse | ErrorResponse,
      SignUpRequest
    >,
    res,
  ) => {
    const { first_name, last_name, email, password } = req.body;

    if (db.data.authUsers.some((u: IAuthUser) => u.email === email)) {
      res.status(400).json({ error: 'email already exists' });
      return;
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

    res.json({ message: 'User signed up successfully', employee: newEmployee });
  },
);

app.put<
  { id: string },
  { message: string; employee: IEmployee } | ErrorResponse,
  Partial<IEmployee>
>('/users/:id', async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  await db.read();

  const employee = db.data.employees.find((e: IEmployee) => e._id === id);

  if (!employee) {
    res.status(404).json({ error: 'employee not found' });
    return;
  }
  Object.assign(employee, updatedFields);

  await db.write();
  res.json({ message: 'employee updated successfully', employee });
});

app.put<{ id: string }, UpdateRoleResponse | ErrorResponse, UpdateRoleRequest>(
  '/users/:id/role',
  authMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const { newRole } = req.body;

    const admin = db.data.employees.find((u: IEmployee) => u._id === '11');

    await db.read();
    const employeeToEdit = db.data.employees.find(
      (e: IEmployee) => e._id === id,
    );

    if (admin && admin._id === id) {
      res.status(403).json({ error: 'Cannot edit your own role.' });
      return;
    }

    if (!employeeToEdit) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    employeeToEdit.role = newRole;

    await db.write();

    res.json({
      message: 'Role updated successfully',
      employee: employeeToEdit,
    });
  },
);

app.get<{ id: string }, IRequestData[] | ErrorResponse>(
  '/requests/:id',
  async (req, res) => {
    const employee = db.data.employees.find((emp) => emp._id === req.params.id);

    if (!employee) {
      res.status(401).json({ error: 'employee not found' });
      return;
    }

    res.json(employee.requests);
  },
);

app.post<{ id: string }, IRequestData | ErrorResponse, IRequestData>(
  '/requests/:id',
  async (req, res) => {
    const { id } = req.params;
    const newRequest = req.body;

    const employee = db.data.employees.find((emp) => emp._id === id);

    if (!employee) {
      res.status(401).json({ error: 'employee not found' });
      return;
    }

    const finalizedRequest: IRequestData = {
      ...newRequest,
      employeeId: id,
      id: uuidv4(),
      status: 'pending',
    };

    employee.requests.unshift(finalizedRequest);

    await db.write();

    res.status(201).json(finalizedRequest);
  },
);

app.put('/requests/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const { requestId, newStatus } = req.body;

  if (!db.data) return res.status(500).send('Database not loaded');

  const employee = db.data.employees.find((emp) => emp._id === employeeId);

  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  const request = employee.requests.find(
    (r) => String(r.id) === String(requestId),
  );
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  request.status = newStatus;
  await db.write();
  return res.status(200).json(request);
});

app.post(
  '/users',
  authMiddleware,
  async (
    req: Request<
      Record<string, never>,
      CreateUserResponse | ErrorResponse,
      CreateUserRequest
    >,
    res: Response<CreateUserResponse | ErrorResponse>,
  ) => {
    if (!db.data) return res.status(500).json({ error: 'Database not loaded' });
    const {
      first_name,
      last_name,
      role,
      user_avatar,
      first_native_name,
      middle_native_name,
      last_native_name,
      department,
      email,
      phone,
      building,
      room,
      desk_number,
      isRemoteWork,
      zoom_id,
      zoom_link,
      citizenship,
      date_birth,
      manager,
      visa,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !department ||
      !building ||
      !room
    ) {
      res.status(400).json({ error: 'missing required employee fields' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailExists =
      db.data.authUsers.some((u: IAuthUser) => u.email === normalizedEmail) ||
      db.data.employees.some((e: IEmployee) => e.email === normalizedEmail);

    if (emailExists) {
      res.status(400).json({ error: 'email already exists' });
      return;
    }

    const temporaryPassword = generateTemporaryPassword();
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 13;
    const hashed_password = await bcrypt.hash(temporaryPassword, saltRounds);

    const newAuthUser: IAuthUser = {
      email: normalizedEmail,
      hashed_password,
      must_change_password: true,
    };

    const newEmployee: IEmployee = {
      _id: (db.data.employees.length + 1).toString(),
      role: role || 'Employee',
      user_avatar: user_avatar || '/users/default.jpg',
      first_name,
      last_name,
      first_native_name: first_native_name || '',
      middle_native_name: middle_native_name || '',
      last_native_name: last_native_name || '',
      department,
      building,
      room,
      desk_number: desk_number ?? null,
      isRemoteWork: isRemoteWork ?? false,
      phone: phone || '',
      email: normalizedEmail,
      zoom_id: zoom_id || '',
      zoom_link: zoom_link || '',
      citizenship: citizenship || '',
      date_birth: date_birth || { year: null, month: null, day: null },
      manager: manager || { id: '', first_name: '', last_name: '' },
      visa: visa || [],
      requests: [],
    };

    db.data.authUsers.push(newAuthUser);
    db.data.employees.push(newEmployee);
    await db.write();

    res.status(201).json({
      message: 'employee created successfully',
      employee: newEmployee,
      temporaryPassword,
    });
  },
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
