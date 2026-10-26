import bcrypt from 'bcrypt';
import { generateTemporaryPassword } from './password.js';
import { v4 as uuidv4 } from 'uuid';

import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateRoleRequest,
  UploadSpreadsheetResponse,
  UpdateRoleResponse,
} from '../serverTypes.js';
import type { IEmployee } from '../employeeTypes.js';
import { ServiceError } from './serviceError.js';
import type { Repositories } from '../repositories/index.js';
import { toEmployeeResponse } from '../mappers/employeeMapper.js';
import {
  createAccount,
  isEmailConflict,
  makeProfile,
} from './accountCreation.js';
import type { Pool } from 'pg';
import { updateEmployeeSql, type ProfilePatch } from './updateEmployee.js';

import { updateRoleSql } from './updateRole.js';
import { uploadSpreadsheetSql } from './uploadSpreadsheetSql.js';

export function createEmployeeService(pool: Pool, repositories: Repositories) {
  // get /users
  async function listEmployees(): Promise<IEmployee[]> {
    const rows = await repositories.employees.listAll();

    return rows.map((row) =>
      toEmployeeResponse(row, row.manager, row.visas, row.requests),
    );
  }
  // get /users/:id
  async function getEmployee(id: string): Promise<IEmployee> {
    const row = await repositories.employees.findById(id);

    if (!row) {
      throw new ServiceError(400, { error: 'user not found' });
    }

    const manager = row.manager_id
      ? await repositories.employees.findManager(row.manager_id)
      : null;
    const visas = await repositories.visas.listByEmployeeId(id);
    const requests = await repositories.requests.listByEmployeeId(id);

    return toEmployeeResponse(row, manager, visas, requests);
  }

  async function updateEmployee(
    id: string,
    body: ProfilePatch,
  ): Promise<UpdateRoleResponse> {
    return updateEmployeeSql(pool, id, body, getEmployee);
  }
  async function updateRole(
    id: string,
    body: UpdateRoleRequest,
  ): Promise<UpdateRoleResponse> {
    return updateRoleSql(pool, id, body.newRole, getEmployee);
  }
  async function createEmployee(
    body: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    if (!body.department || !body.building || !body.room)
      throw new ServiceError(400, {
        error: 'missing required employee fields',
      });
    const profile = makeProfile(body, uuidv4());

    const temporaryPassword = generateTemporaryPassword();
    const hash = await bcrypt.hash(
      temporaryPassword,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 13,
    );

    try {
      const employee = await createAccount(pool, profile, hash, true);
      return {
        message: 'employee created successfully',
        employee,
        temporaryPassword,
      };
    } catch (error) {
      if (isEmailConflict(error))
        throw new ServiceError(400, { error: 'email already exists' });
      throw error;
    }
  }

  async function uploadSpreadsheet(
    buffer: Buffer,
  ): Promise<UploadSpreadsheetResponse> {
    try {
      return await uploadSpreadsheetSql(pool, buffer);
    } catch (error) {
      if (error instanceof ServiceError) throw error;

      throw new ServiceError(500, {
        error: 'failed to read spreadsheet',
      });
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
