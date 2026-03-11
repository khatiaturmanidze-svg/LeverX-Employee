import { JSONFilePreset } from 'lowdb/node';
import bcrypt from 'bcrypt';
import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import type {
  IAuthUser,
  SignInRequest,
  SignUpRequest,
  UpdateRoleRequest,
  SignInResponse,
  SignUpResponse,
  ErrorResponse,
  UpdateRoleResponse,
  DatabaseSchema,
} from './serverTypes.js';
import type { IEmployee, IRequestData } from './employeeTypes.js';
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../dist')));

// Use an absolute path so it works both when running from `server/`
// and when running compiled output from `dist-server/`.
const dbFilePath = path.join(__dirname, '../src/db.json');
const db = await JSONFilePreset<DatabaseSchema>(dbFilePath, {
  authUsers: [],
  employees: [],
});

const DUMMY_TOKEN = 'authorized-can-access';

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

    const hashed_password = await bcrypt.hash(password, 13);

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
      id: Math.random().toString(4),
      status: 'pending',
    };

    employee.requests.push(finalizedRequest);

    res.status(201).json(finalizedRequest);
  },
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
