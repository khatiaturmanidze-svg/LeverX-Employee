import type { RequestHandler } from 'express';
import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateRoleRequest,
  ErrorResponse,
  UploadSpreadsheetResponse,
  UpdateRoleResponse,
} from '../serverTypes.js';
import type { IEmployee } from '../employeeTypes.js';
import type { createEmployeeService } from '../services/employeeService.js';

export function createEmployeeController(
  service: ReturnType<typeof createEmployeeService>,
) {
  const listEmployees: RequestHandler<
    Record<string, never>,
    IEmployee[] | ErrorResponse
  > = async (_req, res) => {
    res.status(200).json(await service.listEmployees());
  };

  const getEmployee: RequestHandler<
    { id: string },
    IEmployee | ErrorResponse
  > = async (req, res) => {
    res.status(200).json(await service.getEmployee(req.params.id));
  };

  const updateEmployee: RequestHandler<
    { id: string },
    { message: string; employee: IEmployee } | ErrorResponse,
    Partial<IEmployee>
  > = async (req, res) => {
    res.status(200).json(await service.updateEmployee(req.params.id, req.body));
  };

  const updateRole: RequestHandler<
    { id: string },
    UpdateRoleResponse | ErrorResponse,
    UpdateRoleRequest
  > = async (req, res) => {
    res.status(200).json(await service.updateRole(req.params.id, req.body));
  };

  const createEmployee: RequestHandler<
    Record<string, never>,
    CreateUserResponse | ErrorResponse,
    CreateUserRequest
  > = async (req, res) => {
    res.status(201).json(await service.createEmployee(req.body));
  };

  const uploadSpreadsheet: RequestHandler<
    Record<string, never>,
    UploadSpreadsheetResponse | ErrorResponse
  > = async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'file is required' });
      return;
    }
    res.status(200).json(await service.uploadSpreadsheet(req.file.buffer));
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
