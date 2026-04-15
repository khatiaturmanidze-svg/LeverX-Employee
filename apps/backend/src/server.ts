import bcrypt from 'bcrypt';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import xlsx from 'xlsx';
import type {
  IAuthUser,
  CreateUserRequest,
  CreateUserResponse,
  SpreadsheetRow,
  SetNewPasswordRequest,
  SetNewPasswordResponse,
  SignInRequest,
  SignUpRequest,
  UpdateRoleRequest,
  SignInResponse,
  SignUpResponse,
  ErrorResponse,
  UploadSpreadsheetResponse,
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
const upload = multer({ storage: multer.memoryStorage() });

const db = await initDatabase();
const DUMMY_TOKEN = process.env.VITE_AUTH_TOKEN || 'secret-token';

function getCellString(value: SpreadsheetRow[string]): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }

  return '';
}

function getOptionalNumber(value: SpreadsheetRow[string]): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getBooleanValue(value: SpreadsheetRow[string]): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === 'yes' || normalized === '1';
  }

  return false;
}

function getNextEmployeeId(): string {
  const maxId = db.data.employees.reduce((currentMax, employee) => {
    const parsedId = Number(employee._id);
    return Number.isFinite(parsedId)
      ? Math.max(currentMax, parsedId)
      : currentMax;
  }, 0);

  return String(maxId + 1);
}

function createEmployeeFromSpreadsheetRow(
  row: SpreadsheetRow,
  employeeId: string,
): IEmployee {
  return {
    _id: employeeId,
    role: getCellString(row.role) || 'Employee',
    user_avatar: getCellString(row.user_avatar) || '/users/dumplinh.jpg',
    first_name: getCellString(row.first_name),
    last_name: getCellString(row.last_name),
    first_native_name: getCellString(row.first_native_name),
    middle_native_name: getCellString(row.middle_native_name),
    last_native_name: getCellString(row.last_native_name),
    department: getCellString(row.department),
    building: getCellString(row.building),
    room: getCellString(row.room),
    desk_number: getOptionalNumber(row.desk_number),
    isRemoteWork: getBooleanValue(row.isRemoteWork),
    phone: getCellString(row.phone),
    email: getCellString(row.email).toLowerCase(),
    zoom_id: getCellString(row.zoom_id),
    zoom_link: getCellString(row.zoom_link),
    citizenship: getCellString(row.citizenship),
    date_birth: {
      year: getOptionalNumber(row.date_birth_year),
      month: getOptionalNumber(row.date_birth_month),
      day: getOptionalNumber(row.date_birth_day),
    },
    manager: {
      id: getCellString(row.manager_id),
      first_name: getCellString(row.manager_first_name),
      last_name: getCellString(row.manager_last_name),
    },
    visa: [],
    requests: [],
  };
}

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
      mustChangePassword: user.must_change_password ?? false,
    });
  },
);

app.post<
  Record<string, never>,
  SetNewPasswordResponse | ErrorResponse,
  SetNewPasswordRequest
>(
  '/set-new-password',
  authMiddleware,
  async (
    req: Request<
      Record<string, never>,
      SetNewPasswordResponse | ErrorResponse,
      SetNewPasswordRequest
    >,
    res,
  ) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ error: 'email and new password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.data.authUsers.find(
      (authUser: IAuthUser) => authUser.email === normalizedEmail,
    );

    if (!user) {
      res.status(404).json({ error: 'user not found' });
      return;
    }

    if (!user.must_change_password) {
      res.status(400).json({ error: 'password change is not required' });
      return;
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 13;
    user.hashed_password = await bcrypt.hash(newPassword, saltRounds);
    user.must_change_password = false;

    await db.write();

    res.json({ message: 'password updated successfully' });
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
      user_avatar: user_avatar || '/users/dumplinh.jpg',
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

app.post<Record<string, never>, UploadSpreadsheetResponse | ErrorResponse>(
  '/users/upload',
  authMiddleware,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'file is required' });
        return;
      }

      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        res.status(400).json({ error: 'spreadsheet is empty' });
        return;
      }

      const sheet = workbook.Sheets[firstSheetName];
      const data = xlsx.utils.sheet_to_json<SpreadsheetRow>(sheet, {
        defval: null,
      });

      const importedUsers: UploadSpreadsheetResponse['importedUsers'] = [];
      const skippedRows: UploadSpreadsheetResponse['skippedRows'] = [];
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 13;
      const seenEmails = new Set([
        ...db.data.authUsers.map((user) => user.email.toLowerCase()),
        ...db.data.employees.map((employee) => employee.email.toLowerCase()),
      ]);

      for (const [index, row] of data.entries()) {
        const first_name = getCellString(row.first_name);
        const last_name = getCellString(row.last_name);
        const email = getCellString(row.email).toLowerCase();
        const department = getCellString(row.department);
        const building = getCellString(row.building);
        const room = getCellString(row.room);

        if (
          !first_name ||
          !last_name ||
          !email ||
          !department ||
          !building ||
          !room
        ) {
          skippedRows.push({
            row: index + 2,
            email,
            error: 'missing required fields',
          });
          continue;
        }

        if (seenEmails.has(email)) {
          skippedRows.push({
            row: index + 2,
            email,
            error: 'email already exists',
          });
          continue;
        }

        const employeeId = getNextEmployeeId();
        const temporaryPassword = generateTemporaryPassword();
        const hashed_password = await bcrypt.hash(
          temporaryPassword,
          saltRounds,
        );

        const employee = createEmployeeFromSpreadsheetRow(row, employeeId);
        const authUser: IAuthUser = {
          email,
          hashed_password,
          must_change_password: true,
        };

        db.data.authUsers.push(authUser);
        db.data.employees.push(employee);
        seenEmails.add(email);

        importedUsers.push({
          email,
          temporaryPassword,
          employeeId,
        });
      }

      await db.write();

      res.json({
        message: 'spreadsheet imported successfully',
        count: importedUsers.length,
        importedUsers,
        skippedRows,
      });
    } catch {
      res.status(500).json({ error: 'failed to read spreadsheet' });
    }
  },
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
