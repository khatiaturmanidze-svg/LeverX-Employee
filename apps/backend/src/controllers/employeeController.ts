import { verifiedActor } from '../middleware/authorization.js';
import type { RequestHandler } from 'express';
import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateRoleRequest,
  ErrorResponse,
  UploadSpreadsheetResponse,
  UpdateRoleResponse,
} from '../types/serverTypes.js';
import type { IEmployee } from '../types/employeeTypes.js';
import type { createEmployeeService } from '../services/employeeService.js';
import type { ProfilePatch } from '../services/updateEmployee.js';

export function createEmployeeController(
  service: ReturnType<typeof createEmployeeService>,
) {
  const listEmployees: RequestHandler<
    Record<string, never>,
    IEmployee[] | ErrorResponse
  > = async (req, res) => {
    res.status(200).json(await service.listEmployees(verifiedActor(req)));
  };

  const getEmployee: RequestHandler<
    { id: string },
    IEmployee | ErrorResponse
  > = async (req, res) => {
    res
      .status(200)
      .json(await service.getEmployee(verifiedActor(req), req.params.id));
  };

  const updateEmployee: RequestHandler<
    { id: string },
    { message: string; employee: IEmployee } | ErrorResponse,
    ProfilePatch
  > = async (req, res) => {
    res
      .status(200)
      .json(
        await service.updateEmployee(
          verifiedActor(req),
          req.params.id,
          req.body,
        ),
      );
  };

  const updateRole: RequestHandler<
    { id: string },
    UpdateRoleResponse | ErrorResponse,
    UpdateRoleRequest
  > = async (req, res) => {
    res
      .status(200)
      .json(
        await service.updateRole(verifiedActor(req), req.params.id, req.body),
      );
  };

  const createEmployee: RequestHandler<
    Record<string, never>,
    CreateUserResponse | ErrorResponse,
    CreateUserRequest
  > = async (req, res) => {
    res
      .status(201)
      .json(await service.createEmployee(verifiedActor(req), req.body));
  };

  const uploadSpreadsheet: RequestHandler<
    Record<string, never>,
    UploadSpreadsheetResponse | ErrorResponse
  > = async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'file is required' });
      return;
    }
    res
      .status(200)
      .json(
        await service.uploadSpreadsheet(verifiedActor(req), req.file.buffer),
      );
  };
  return {
    listEmployees,
    getEmployee,
    updateEmployee,
    updateRole,
    createEmployee,
    uploadSpreadsheet,
  };
}
