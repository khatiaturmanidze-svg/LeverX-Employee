import bcrypt from 'bcrypt';
import { generateTemporaryPassword } from './password.js';
import { v4 as uuidv4 } from 'uuid';

import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateRoleRequest,
  UploadSpreadsheetResponse,
  UpdateRoleResponse,
} from '../types/serverTypes.js';
import type { IEmployee } from '../types/employeeTypes.js';
import { ServiceError } from './serviceError.js';
import type { Repositories } from '../repositories/index.js';
import { toEmployeeResponse } from '../mappers/employeeMapper.js';
import {
  createAccount,
  isEmailConflict,
  makeProfile,
} from './accountCreation.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import { updateEmployeeProfile, type ProfilePatch } from './updateEmployee.js';

import { updateEmployeeRole } from './updateRole.js';
import { importSpreadsheet } from './uploadSpreadsheet.js';
import type { VerifiedUser } from '../types/auth.js';
import { currentActor, requireAdmin, ROLES } from './permissions.js';

export function createEmployeeService(
  prisma: PrismaClient,
  repositories: Repositories,
) {
  function visibleProfile(actor: VerifiedUser, response: IEmployee): IEmployee {
    if (
      actor.role === 'Admin' ||
      response._id === actor.id ||
      response.manager?.id === actor.id
    )
      return response;
    // The directory exposes work contact information, not travel, birth, or leave data.
    return {
      _id: response._id,
      role: response.role,
      user_avatar: response.user_avatar,
      first_name: response.first_name,
      last_name: response.last_name,
      department: response.department,
      building: response.building,
      room: response.room,
      desk_number: response.desk_number,
      isRemoteWork: response.isRemoteWork,
      email: response.email,
      phone: response.phone,
      zoom_id: response.zoom_id,
      zoom_link: response.zoom_link,
      manager: response.manager,
      requests: [],
    };
  }

  // get /users
  async function listEmployees(actor: VerifiedUser): Promise<IEmployee[]> {
    const rows = await repositories.employees.listAll();
    return rows.map((row) => visibleProfile(actor, toEmployeeResponse(row)));
  }
  // get /users/:id
  async function getEmployee(
    actor: VerifiedUser,
    id: string,
  ): Promise<IEmployee> {
    const row = await repositories.employees.findById(id);

    if (!row) {
      throw new ServiceError(404, { error: 'user not found' });
    }

    return visibleProfile(actor, toEmployeeResponse(row));
  }

  async function updateEmployee(
    actor: VerifiedUser,
    id: string,
    body: ProfilePatch,
  ): Promise<UpdateRoleResponse> {
    return updateEmployeeProfile(
      prisma,
      id,
      body,
      (target) => getEmployee(actor, target),
      actor,
    );
  }
  async function updateRole(
    actor: VerifiedUser,
    id: string,
    body: UpdateRoleRequest,
  ): Promise<UpdateRoleResponse> {
    return updateEmployeeRole(
      prisma,
      id,
      body.newRole,
      (target) => getEmployee(actor, target),
      actor,
    );
  }
  async function createEmployee(
    actor: VerifiedUser,
    body: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    requireAdmin(await currentActor(prisma, actor));
    if (
      body.role !== undefined &&
      !ROLES.includes(body.role as (typeof ROLES)[number])
    ) {
      throw new ServiceError(400, { error: 'Invalid employee role' });
    }
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
      const employee = await createAccount(prisma, profile, hash, true, actor);
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
    actor: VerifiedUser,
    buffer: Buffer,
  ): Promise<UploadSpreadsheetResponse> {
    requireAdmin(await currentActor(prisma, actor));
    try {
      return await importSpreadsheet(prisma, buffer, actor);
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
