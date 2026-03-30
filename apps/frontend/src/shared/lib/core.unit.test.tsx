import { describe, it, expect } from 'vitest';
import {
  getLoggedInUser,
  getUserById,
  canEdit,
  formatDateOfBirth,
  getErrorMessage,
  getDisplayStatus,
  getManagedEmployees,
  validateRequest,
} from './core';
import { IEmployee, IDateOfBirth } from '../../types/type';
import { IRequestData } from '../../features/requests/model/state.types';

describe('core utilities', () => {
  const mockEmployee: IEmployee = {
    _id: '1',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'User',
    department: 'IT',
    building: 'A',
    room: '101',
    phone: '+1234567890',
    citizenship: 'US',
    isRemoteWork: false,
    user_avatar: '',
  };

  const mockAdmin: IEmployee = {
    _id: 'admin1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'Admin',
    department: 'HR',
    building: 'A',
    room: '100',
    phone: '+0987654321',
    citizenship: 'US',
    isRemoteWork: false,
    user_avatar: '',
  };

  const mockManager: IEmployee = {
    _id: 'manager1',
    email: 'manager@example.com',
    first_name: 'Manager',
    last_name: 'User',
    role: 'User',
    department: 'IT',
    building: 'A',
    room: '102',
    phone: '+1111111111',
    citizenship: 'US',
    isRemoteWork: false,
    user_avatar: '',
  };

  describe('getLoggedInUser', () => {
    it('should return user from localStorage', () => {
      localStorage.setItem('loggedInUser', 'test@example.com');
      const result = getLoggedInUser([mockEmployee]);
      expect(result).toEqual(mockEmployee);
    });

    it('should return user from sessionStorage', () => {
      sessionStorage.setItem('loggedInUser', 'test@example.com');
      const result = getLoggedInUser([mockEmployee]);
      expect(result).toEqual(mockEmployee);
    });

    it('should return undefined if user not found', () => {
      localStorage.setItem('loggedInUser', 'nonexistent@example.com');
      const result = getLoggedInUser([mockEmployee]);
      expect(result).toBeUndefined();
    });

    it('should return undefined if no logged in user is set', () => {
      const result = getLoggedInUser([mockEmployee]);
      expect(result).toBeUndefined();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', () => {
      const result = getUserById([mockEmployee, mockAdmin], '1');
      expect(result).toEqual(mockEmployee);
    });

    it('should return undefined if user not found', () => {
      const result = getUserById([mockEmployee], 'nonexistent');
      expect(result).toBeUndefined();
    });

    it('should return undefined if no id provided', () => {
      const result = getUserById([mockEmployee]);
      expect(result).toBeUndefined();
    });

    it('should handle empty user list', () => {
      const result = getUserById([], '1');
      expect(result).toBeUndefined();
    });
  });

  describe('canEdit', () => {
    it('should return false if logged in user is undefined', () => {
      const result = canEdit(undefined, mockEmployee);
      expect(result).toBe(false);
    });

    it('should return true if logged in user is admin', () => {
      const result = canEdit(mockAdmin, mockEmployee);
      expect(result).toBe(true);
    });

    it('should return true if logged in user is the manager', () => {
      const employee: IEmployee = {
        ...mockEmployee,
        manager: {
          id: 'manager1',
          first_name: 'Manager',
          last_name: 'User',
        },
      };
      const result = canEdit(mockManager, employee);
      expect(result).toBe(true);
    });

    it('should return false if logged in user is neither admin nor manager', () => {
      const employee: IEmployee = {
        ...mockEmployee,
        manager: {
          id: 'manager1',
          first_name: 'Manager',
          last_name: 'User',
        },
      };
      const result = canEdit(mockEmployee, employee);
      expect(result).toBe(false);
    });

    it('should return false if employee has no manager', () => {
      const result = canEdit(mockEmployee, mockAdmin);
      expect(result).toBe(false);
    });
  });

  describe('formatDateOfBirth', () => {
    it('should return "no date" for null', () => {
      const result = formatDateOfBirth(null);
      expect(result).toBe('no date');
    });

    it('should return "no date" for undefined', () => {
      const result = formatDateOfBirth(undefined);
      expect(result).toBe('no date');
    });

    it('should return "date of birth not set" if year is missing', () => {
      const date: IDateOfBirth = { year: null, month: 5, day: 15 };
      const result = formatDateOfBirth(date);
      expect(result).toBe('date of birth not set');
    });

    it('should return "date of birth not set" if month is missing', () => {
      const date: IDateOfBirth = { year: 1990, month: null, day: 15 };
      const result = formatDateOfBirth(date);
      expect(result).toBe('date of birth not set');
    });

    it('should return "date of birth not set" if day is missing', () => {
      const date: IDateOfBirth = { year: 1990, month: 5, day: null };
      const result = formatDateOfBirth(date);
      expect(result).toBe('date of birth not set');
    });

    it('should format valid date correctly', () => {
      const date: IDateOfBirth = { year: 1990, month: 5, day: 15 };
      const result = formatDateOfBirth(date);
      expect(result).toContain('15');
      expect(result).toContain('May');
      expect(result).toContain('1990');
    });
  });

  describe('getErrorMessage', () => {
    it('should return string error from RTK error data', () => {
      const error = { status: 400, data: 'Bad request' };
      const result = getErrorMessage(error);
      expect(result).toBe('Bad request');
    });

    it('should return message from structured error data', () => {
      const error = { status: 400, data: { message: 'Invalid input' } };
      const result = getErrorMessage(error);
      expect(result).toBe('Invalid input');
    });

    it('should return error from structured error data', () => {
      const error = { status: 400, data: { error: 'Validation failed' } };
      const result = getErrorMessage(error);
      expect(result).toBe('Validation failed');
    });

    it('should return details from structured error data', () => {
      const error = { status: 400, data: { details: 'Field required' } };
      const result = getErrorMessage(error);
      expect(result).toBe('Field required');
    });

    it('should return 401 status message', () => {
      const error = { status: 401, data: {} };
      const result = getErrorMessage(error);
      expect(result).toBe('Invalid email or password');
    });

    it('should return 403 status message', () => {
      const error = { status: 403, data: {} };
      const result = getErrorMessage(error);
      expect(result).toBe('You are not authorized');
    });

    it('should return 404 status message', () => {
      const error = { status: 404, data: {} };
      const result = getErrorMessage(error);
      expect(result).toBe('Resource not found');
    });

    it('should return 500+ status message', () => {
      const error = { status: 500, data: {} };
      const result = getErrorMessage(error);
      expect(result).toBe('Server error, try again later');
    });

    it('should return Error message', () => {
      const error = new Error('Test error');
      const result = getErrorMessage(error);
      expect(result).toBe('Test error');
    });

    it('should return default message for unknown error', () => {
      const result = getErrorMessage('unknown');
      expect(result).toBe('Something went wrong');
    });
  });

  describe('getDisplayStatus', () => {
    it('should return "pending" for pending status', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const request: IRequestData = {
        status: 'pending',
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
      } as IRequestData;
      const result = getDisplayStatus(request);
      expect(result).toBe('pending');
    });

    it('should return "rejected" for rejected status', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const request: IRequestData = {
        status: 'rejected',
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
      } as IRequestData;
      const result = getDisplayStatus(request);
      expect(result).toBe('rejected');
    });

    it('should return "active" for approved request within date range', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const request: IRequestData = {
        status: 'approved',
        start_date: yesterday.toISOString().split('T')[0],
        end_date: tomorrow.toISOString().split('T')[0],
      } as IRequestData;
      const result = getDisplayStatus(request);
      expect(result).toBe('active');
    });

    it('should return "upcoming" for approved request before start date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const request: IRequestData = {
        status: 'approved',
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
      } as IRequestData;
      const result = getDisplayStatus(request);
      expect(result).toBe('upcoming');
    });

    it('should return "completed" for approved request after end date', () => {
      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const request: IRequestData = {
        status: 'approved',
        start_date: twoWeeksAgo.toISOString().split('T')[0],
        end_date: yesterday.toISOString().split('T')[0],
      } as IRequestData;
      const result = getDisplayStatus(request);
      expect(result).toBe('completed');
    });
  });

  describe('getManagedEmployees', () => {
    it('should return empty array if no logged in user', () => {
      const result = getManagedEmployees([mockEmployee]);
      expect(result).toEqual([]);
    });

    it('should return managed employees', () => {
      localStorage.setItem('loggedInUser', 'manager@example.com');
      const managed: IEmployee = {
        ...mockEmployee,
        manager: {
          id: 'manager1',
          first_name: 'Manager',
          last_name: 'User',
        },
      };
      const result = getManagedEmployees([mockManager, managed, mockAdmin]);
      expect(result).toEqual([managed]);
    });

    it('should return multiple managed employees', () => {
      localStorage.setItem('loggedInUser', 'manager@example.com');
      const managed1: IEmployee = {
        ...mockEmployee,
        manager: {
          id: 'manager1',
          first_name: 'Manager',
          last_name: 'User',
        },
      };
      const managed2: IEmployee = {
        ...mockAdmin,
        _id: '2',
        manager: {
          id: 'manager1',
          first_name: 'Manager',
          last_name: 'User',
        },
      };
      const result = getManagedEmployees([mockManager, managed1, managed2]);
      expect(result).toHaveLength(2);
    });

    it('should not return employees without manager', () => {
      localStorage.setItem('loggedInUser', 'manager@example.com');
      const result = getManagedEmployees([mockManager, mockEmployee]);
      expect(result).toHaveLength(0);
    });
  });

  describe('validateRequest', () => {
    it('should return empty errors for valid request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const request: IRequestData = {
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
      } as IRequestData;
      const errors = validateRequest(request);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should require start date', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const request: IRequestData = {
        start_date: '',
        end_date: nextWeek.toISOString().split('T')[0],
      } as IRequestData;
      const errors = validateRequest(request);
      expect(errors.start_date).toBe('Start date is required');
    });

    it('should reject past start date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const request: IRequestData = {
        start_date: yesterday.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
      } as IRequestData;
      const errors = validateRequest(request);
      expect(errors.start_date).toBe('Start date cannot be in the past');
    });

    it('should require end date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const request: IRequestData = {
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: '',
      } as IRequestData;
      const errors = validateRequest(request);
      expect(errors.end_date).toBe('End date is required');
    });

    it('should reject end date before start date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const request: IRequestData = {
        start_date: nextWeek.toISOString().split('T')[0],
        end_date: tomorrow.toISOString().split('T')[0],
      } as IRequestData;
      const errors = validateRequest(request);
      expect(errors.end_date).toBe('End date must be after start date');
    });

    it('should return multiple errors', () => {
      const request: IRequestData = {
        start_date: '',
        end_date: '',
      } as IRequestData;
      const errors = validateRequest(request);
      expect(Object.keys(errors).length).toBeGreaterThan(1);
    });
  });
});
