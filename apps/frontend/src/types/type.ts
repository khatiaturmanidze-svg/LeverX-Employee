import { IRequestData } from '../features/requests/model/state.types';
// For date of birth
export interface IDateOfBirth {
  year: number | null;
  month: number | null;
  day: number | null;
}

// Manager info
export interface IManager {
  id: string;
  first_name: string;
  last_name: string;
}

// Visa info

export interface Visa {
  id: string;
  employeeId: string;
  issuing_country: string;
  type: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

export type CreateVisaInput = Omit<Visa, 'id' | 'employeeId'>;
export type UpdateVisaInput = Partial<CreateVisaInput>;

// Employee interface
export interface IEmployee {
  // ID and avatar
  _id: string;
  role: string;
  user_avatar: string;

  // Names
  first_name: string;
  last_name: string;
  first_native_name?: string;
  middle_native_name?: string;
  last_native_name?: string;

  // Job and location
  department: string;
  building: string;
  room: string;
  desk_number?: number | null;
  isRemoteWork: boolean;

  // Contacts
  phone?: string;
  email: string;
  zoom_id?: string;
  zoom_link?: string;

  // Travel info
  citizenship?: string;
  date_birth?: IDateOfBirth;
  manager?: IManager;
  visa?: Visa[];

  requests?: IRequestData[];
}

export type EmployeeUpdate = Partial<Omit<IEmployee, 'manager' | 'visa'>> & {
  manager?: string | null;
  visa?: CreateVisaInput[];
};

export type CreateUserPayload = {
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
  date_birth?: IDateOfBirth;
  manager?: IManager;
  visa?: CreateVisaInput[];
};

export type CreateUserResponse = {
  message: string;
  employee: IEmployee;
  temporaryPassword: string;
};

export type SpreadsheetRow = Record<string, string | number | boolean | null>;

export type UploadedUserResult = {
  email: string;
  temporaryPassword: string;
  employeeId: string;
};

export type UploadSpreadsheetError = {
  row: number;
  email: string;
  error: string;
};

export type UploadSpreadsheetResponse = {
  message: string;
  count: number;
  importedUsers: UploadedUserResult[];
  skippedRows: UploadSpreadsheetError[];
};

export type EditableEmployeeField =
  | 'role'
  | 'department'
  | 'building'
  | 'room'
  | 'desk_number'
  | 'isRemoteWork'
  | 'email';

export type EmployeeDraft = Partial<Record<EditableEmployeeField, string>>;

// Options sent by the frontend and used by the backend.
export interface EmployeeListQuery {
  page: number;
  limit: number;
  name?: string;
}

// Response returned by GET /users.
export interface EmployeePage {
  items: IEmployee[];
  total: number;
  page: number;
  limit: number;
}
