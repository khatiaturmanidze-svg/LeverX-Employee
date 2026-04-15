import type { IEmployee } from './employeeTypes.js';

export interface IAuthUser {
  email: string;
  hashed_password: string;
  must_change_password?: boolean;
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

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  role?: string;
  user_avatar?: string;
  first_native_name?: string;
  middle_native_name?: string;
  last_native_name?: string;
  department: string;
  building: string;
  room: string;
  desk_number?: number | null;
  isRemoteWork?: boolean;
  phone?: string;
  email: string;
  zoom_id?: string;
  zoom_link?: string;
  citizenship?: string;
  date_birth?: IEmployee['date_birth'];
  manager?: IEmployee['manager'];
  visa?: IEmployee['visa'];
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

export interface CreateUserResponse {
  message: string;
  employee: IEmployee;
  temporaryPassword: string;
}

export type SpreadsheetRow = Record<string, string | number | boolean | null>;

export interface UploadedUserResult {
  email: string;
  temporaryPassword: string;
  employeeId: string;
}

export interface UploadSpreadsheetError {
  row: number;
  email: string;
  error: string;
}

export interface UploadSpreadsheetResponse {
  message: string;
  count: number;
  importedUsers: UploadedUserResult[];
  skippedRows: UploadSpreadsheetError[];
}

export interface ErrorResponse {
  error: string;
}

export interface AuthUserContext {
  id: string;
  role: string;
}
