import { describe, expect, it } from 'vitest';
import { filterAdvancedUsers, filterUsers } from './userFilters';
import { IEmployee } from '../../../types/type';

const users: IEmployee[] = [
  {
    _id: '1',
    role: 'Employee',
    user_avatar: '',
    first_name: 'John',
    last_name: 'Doe',
    department: 'Engineering',
    building: 'A',
    room: '101',
    isRemoteWork: false,
    phone: '111',
    email: 'john@company.com',
    zoom_id: 'john.zoom',
  },
  {
    _id: '2',
    role: 'Manager',
    user_avatar: '',
    first_name: 'Alice',
    last_name: 'Smith',
    department: 'HR',
    building: 'B',
    room: '202',
    isRemoteWork: true,
    phone: '222',
    email: 'alice@company.com',
    zoom_id: 'alice.zoom',
  },
];

describe('user filters', () => {
  describe('filterUsers', () => {
    it('returns all users when fullname is empty/blank', () => {
      const result = filterUsers(users, { fullname: '   ' });
      expect(result).toEqual(users);
    });

    it('filters by full name case-insensitively', () => {
      const result = filterUsers(users, { fullname: 'john doe' });
      expect(result).toEqual([users[0]]);
    });

    it('matches partial full name', () => {
      const result = filterUsers(users, { fullname: 'alice' });
      expect(result).toEqual([users[1]]);
    });
  });

  describe('filterAdvancedUsers', () => {
    it('returns all users when criteria are empty and any', () => {
      const result = filterAdvancedUsers(users, {
        name: '',
        email: '',
        phone: '',
        zoom: '',
        building: 'any',
        room: '',
        department: 'Any',
      });

      expect(result).toEqual(users);
    });

    it('filters by trimmed/case-insensitive name', () => {
      const result = filterAdvancedUsers(users, {
        name: '  ALICE  ',
        email: '',
        phone: '',
        zoom: '',
        building: 'any',
        room: '',
        department: 'any',
      });

      expect(result).toEqual([users[1]]);
    });

    it('filters by exact email and phone values', () => {
      const result = filterAdvancedUsers(users, {
        name: '',
        email: 'john@company.com',
        phone: '111',
        zoom: '',
        building: 'any',
        room: '',
        department: 'any',
      });

      expect(result).toEqual([users[0]]);
    });

    it('filters by building, room and department with any fallback', () => {
      const result = filterAdvancedUsers(users, {
        name: '',
        email: '',
        phone: '',
        zoom: '',
        building: 'b',
        room: '202',
        department: 'hr',
      });

      expect(result).toEqual([users[1]]);
    });

    it('returns no users when one strict criterion does not match', () => {
      const result = filterAdvancedUsers(users, {
        name: '',
        email: 'john@company.com',
        phone: '999',
        zoom: '',
        building: 'any',
        room: '',
        department: 'any',
      });

      expect(result).toEqual([]);
    });
  });
});
