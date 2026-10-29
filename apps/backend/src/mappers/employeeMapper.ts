import type { LeaveRequest, Prisma } from '../generated/prisma/client.js';
import type { IEmployee, IRequestData } from '../employeeTypes.js';
import type { EmployeeWithRelations } from '../repositories/employeeRepository.js';
import { toVisaResponse } from './visaMapper.js';

export function toEmployeeData(
  profile: Omit<IEmployee, 'visa'>,
): Prisma.EmployeeUncheckedCreateInput {
  return {
    id: profile._id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    role: profile.role,
    userAvatar: profile.user_avatar,
    firstNativeName: profile.first_native_name,
    middleNativeName: profile.middle_native_name,
    lastNativeName: profile.last_native_name,
    department: profile.department,
    building: profile.building,
    room: profile.room,
    deskNumber: profile.desk_number,
    isRemoteWork: profile.isRemoteWork,
    phone: profile.phone,
    zoomId: profile.zoom_id,
    zoomLink: profile.zoom_link,
    citizenship: profile.citizenship,
    birthYear: profile.date_birth?.year ?? null,
    birthMonth: profile.date_birth?.month ?? null,
    birthDay: profile.date_birth?.day ?? null,
    managerId: profile.manager?.id || null,
  };
}

export function toRequestResponse(request: LeaveRequest): IRequestData {
  return {
    id: request.id,
    employeeId: request.employeeId,
    type: request.type,
    start_date: request.startDate.toISOString().slice(0, 10),
    end_date: request.endDate.toISOString().slice(0, 10),
    note: request.note,
    status: request.status as IRequestData['status'],
  };
}

export function toEmployeeResponse(employee: EmployeeWithRelations): IEmployee {
  return {
    _id: employee.id,
    role: employee.role,
    user_avatar: employee.userAvatar,
    first_name: employee.firstName,
    last_name: employee.lastName,
    first_native_name: employee.firstNativeName,
    middle_native_name: employee.middleNativeName,
    last_native_name: employee.lastNativeName,
    department: employee.department,
    building: employee.building,
    room: employee.room,
    desk_number: employee.deskNumber,
    isRemoteWork: employee.isRemoteWork,
    phone: employee.phone,
    email: employee.email,
    zoom_id: employee.zoomId,
    zoom_link: employee.zoomLink,
    citizenship: employee.citizenship,
    date_birth: {
      year: employee.birthYear,
      month: employee.birthMonth,
      day: employee.birthDay,
    },
    manager: employee.manager
      ? {
          id: employee.manager.id,
          first_name: employee.manager.firstName,
          last_name: employee.manager.lastName,
        }
      : { id: '', first_name: '', last_name: '' },
    visa: employee.visas.map(toVisaResponse),
    requests: employee.requests.map(toRequestResponse),
  };
}
