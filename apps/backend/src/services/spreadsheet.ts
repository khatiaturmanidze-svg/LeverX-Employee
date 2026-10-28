import type { SpreadsheetRow } from '../serverTypes.js';
import type { IEmployee } from '../employeeTypes.js';
export function getCellString(value: SpreadsheetRow[string]): string {
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

export function createEmployeeFromSpreadsheetRow(
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
