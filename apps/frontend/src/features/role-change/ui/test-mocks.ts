import type { IEmployee } from '../../../types/type';

export const createRoleChangeUser = (role: string): IEmployee => ({
  _id: 'emp-1',
  role,
  user_avatar: '/avatar.png',
  first_name: 'John',
  last_name: 'Doe',
  department: 'Engineering',
  building: 'A',
  room: '101',
  isRemoteWork: false,
  email: 'john@company.com',
});
