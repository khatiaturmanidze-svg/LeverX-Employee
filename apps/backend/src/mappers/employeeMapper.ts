// Assemble the existing IEmployee response from an employee/manager row and related arrays.

import type {
  IEmployee,
  IManager,
  IVisa,
  IRequestData,
} from '../employeeTypes.js';
import type { EmployeeRow } from '../repositories/types.js';

/*
  export function toEmployeeResponse(
  row: EmployeeRow,
  manager: IManager | null,
  visas: IVisa[],
  requests: IRequestData[],
  ): IEmployee
 */

export function toEmployeeResponse(
  row: EmployeeRow,
  manager: IManager | null,
  visas: IVisa[],
  requests: IRequestData[],
): IEmployee {
  return {
    _id: row.id,
    role: row.role,
    user_avatar: row.user_avatar,
    first_name: row.first_name,
    last_name: row.last_name,
    first_native_name: row.first_native_name,
    middle_native_name: row.middle_native_name,
    last_native_name: row.last_native_name,
    department: row.department,
    building: row.building,
    room: row.room,
    desk_number: row.desk_number,
    isRemoteWork: row.is_remote_work,
    phone: row.phone,
    email: row.email,
    zoom_id: row.zoom_id,
    zoom_link: row.zoom_link,
    citizenship: row.citizenship,
    date_birth: {
      year: row.birth_year,
      month: row.birth_month,
      day: row.birth_day,
    },
    manager: manager ?? { id: '', first_name: '', last_name: '' },
    visa: visas,
    requests,
  };
}
