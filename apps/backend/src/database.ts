import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { DatabaseSchema } from './serverTypes.js';
import bcrypt from 'bcrypt';
import { IEmployee } from './employeeTypes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_RELATIVE_PATH = process.env.DATABASE_PATH || '../src/db.json';
const dbFilePath = path.resolve(__dirname, DB_RELATIVE_PATH);

// 2. Initial Data Structure
const defaultData: DatabaseSchema = {
  authUsers: [],
  employees: [],
};

const createDefaultAdmin = (overrides: Partial<IEmployee>): IEmployee => {
  return {
    _id: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'Admin',
    user_avatar: '/users/default.jpg',
    first_native_name: '',
    middle_native_name: '',
    last_native_name: '',
    department: 'General',
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
    ...overrides,
  };
};

export const initDatabase = async () => {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = await JSONFilePreset<DatabaseSchema>(dbFilePath, defaultData);

  const testEmail = process.env.VITE_TEST_USER_EMAIL;
  const testPassword = process.env.VITE_TEST_USER_PASSWORD;
  if (
    testEmail &&
    testPassword &&
    !db.data.authUsers.find((u) => u.email === testEmail)
  ) {
    console.log(`sending test user: ${testEmail}`);

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashed_password = await bcrypt.hash(testPassword, saltRounds);

    db.data.authUsers.push({ email: testEmail, hashed_password });

    const testAdmin = createDefaultAdmin({
      _id: 'test-admin-id',
      first_name: 'Test',
      last_name: 'Admin',
      email: testEmail,
      role: 'Admin',
    });

    db.data.employees.push(testAdmin);

    await db.write();
  }

  return db;
};
