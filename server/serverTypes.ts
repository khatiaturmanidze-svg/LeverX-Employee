import type { IEmployee } from "./employeeTypes.js";

export interface IAuthUser {
  email: string;
  hashed_password: string;
}

export interface DatabaseSchema {
  authUsers: IAuthUser[];
  employees: IEmployee[];
}

// Request body types for each endpoint
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface UpdateRoleRequest {
  newRole: string;
}

// Response types
export interface SignInResponse {
  message: string;
  token: string;
  userId: string;
}

export interface SignUpResponse {
  message: string;
  employee: IEmployee;
}

export interface UpdateRoleResponse {
  message: string;
  employee: IEmployee;
}

export interface ErrorResponse {
  error: string;
}

export interface AuthUserContext {
  id: string;
  role: string;
}
