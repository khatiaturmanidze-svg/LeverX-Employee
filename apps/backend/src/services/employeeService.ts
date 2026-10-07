import bcrypt from 'bcrypt';
import { generateTemporaryPassword } from './password.js';
import { v4 as uuidv4 } from 'uuid';
import xlsx from 'xlsx';
import {
  getCellString,
  createEmployeeFromSpreadsheetRow,
} from './spreadsheet.js';
import type {
  IAuthUser,
  CreateUserRequest,
  CreateUserResponse,
  SpreadsheetRow,
  UpdateRoleRequest,
  UploadSpreadsheetResponse,
  UpdateRoleResponse,
} from '../serverTypes.js';
import type { IEmployee } from '../employeeTypes.js';
import type { Database } from './types.js';
import { ServiceError } from './serviceError.js';

export function createEmployeeService(db: Database) {
  function getNextEmployeeId(): string {
    const maxId = db.data.employees.reduce((currentMax, employee) => {
      const parsedId = Number(employee._id);
      return Number.isFinite(parsedId)
        ? Math.max(currentMax, parsedId)
        : currentMax;
    }, 0);

    return String(maxId + 1);
  }
  async function listEmployees(): Promise<IEmployee[]> {
    await db.read();
    return db.data.employees;
  }

  async function getEmployee(id: string): Promise<IEmployee> {
    await db.read();
    const user = db.data.employees.find((u: IEmployee) => u._id === id);

    if (!user) {
      throw new ServiceError(400, { error: 'user not found' });
    }

    return user;
  }

  async function updateEmployee(
    id: string,
    body: Partial<IEmployee>,
  ): Promise<UpdateRoleResponse> {
    const updatedFields = body;

    await db.read();

    const employee = db.data.employees.find((e: IEmployee) => e._id === id);

    if (!employee) {
      throw new ServiceError(404, { error: 'employee not found' });
    }
    Object.assign(employee, updatedFields);

    await db.write();
    return { message: 'employee updated successfully', employee };
  }

  async function updateRole(
    id: string,
    body: UpdateRoleRequest,
  ): Promise<UpdateRoleResponse> {
    const { newRole } = body;

    const admin = db.data.employees.find((u: IEmployee) => u._id === '11');

    await db.read();
    const employeeToEdit = db.data.employees.find(
      (e: IEmployee) => e._id === id,
    );

    if (admin && admin._id === id) {
      throw new ServiceError(403, { error: 'Cannot edit your own role.' });
    }

    if (!employeeToEdit) {
      throw new ServiceError(404, { error: 'Employee not found.' });
    }

    employeeToEdit.role = newRole;

    await db.write();

    return {
      message: 'Role updated successfully',
      employee: employeeToEdit,
    };
  }

  async function createEmployee(
    body: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    if (!db.data) throw new ServiceError(500, { error: 'Database not loaded' });
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
    } = body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !department ||
      !building ||
      !room
    ) {
      throw new ServiceError(400, {
        error: 'missing required employee fields',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailExists =
      db.data.authUsers.some((u: IAuthUser) => u.email === normalizedEmail) ||
      db.data.employees.some((e: IEmployee) => e.email === normalizedEmail);

    if (emailExists) {
      throw new ServiceError(400, { error: 'email already exists' });
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
      _id: uuidv4(),
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

    return {
      message: 'employee created successfully',
      employee: newEmployee,
      temporaryPassword,
    };
  }

  async function uploadSpreadsheet(
    buffer: Buffer,
  ): Promise<UploadSpreadsheetResponse> {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new ServiceError(400, { error: 'spreadsheet is empty' });
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

      return {
        message: 'spreadsheet imported successfully',
        count: importedUsers.length,
        importedUsers,
        skippedRows,
      };
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(500, { error: 'failed to read spreadsheet' });
    }
  }
  return {
    listEmployees,
    getEmployee,
    updateEmployee,
    updateRole,
    createEmployee,
    uploadSpreadsheet,
  };
}
