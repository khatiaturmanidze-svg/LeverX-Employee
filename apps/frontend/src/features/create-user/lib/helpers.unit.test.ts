import { describe, expect, it } from 'vitest';
import { initialState, validateCreateUserForm } from './helpers';

describe('create-user helpers', () => {
  it('provides expected initial state', () => {
    expect(initialState.isSubmitting).toBe(false);
    expect(initialState.errors).toEqual({});
    expect(initialState.formData.first_name).toBe('');
    expect(initialState.formData.role).toBe('Employee');
    expect(initialState.formData.isRemoteWork).toBe(false);
    expect(initialState.formData.visas).toEqual([]);
  });

  it('returns no validation errors for valid form data', () => {
    const errors = validateCreateUserForm({
      ...initialState.formData,
      first_name: 'John',
      last_name: 'Doe',
      role: 'Employee',
      department: 'Engineering',
      building: 'HQ',
      room: '101',
      email: 'john@example.com',
      desk_number: '12',
    });

    expect(errors).toEqual({});
  });

  it('requires mandatory fields', () => {
    const errors = validateCreateUserForm(initialState.formData);

    expect(errors.first_name).toBe('First name is required');
    expect(errors.last_name).toBe('Last name is required');
    expect(errors.department).toBe('Department is required');
    expect(errors.building).toBe('Building is required');
    expect(errors.room).toBe('Room is required');
    expect(errors.email).toBe('Email is required');
  });

  it('validates email format', () => {
    const errors = validateCreateUserForm({
      ...initialState.formData,
      first_name: 'John',
      last_name: 'Doe',
      role: 'Employee',
      department: 'Engineering',
      building: 'HQ',
      room: '101',
      email: 'not-an-email',
    });

    expect(errors.email).toBe('Invalid email');
  });

  it('validates desk number as numeric when provided', () => {
    const errors = validateCreateUserForm({
      ...initialState.formData,
      first_name: 'John',
      last_name: 'Doe',
      role: 'Employee',
      department: 'Engineering',
      building: 'HQ',
      room: '101',
      email: 'john@example.com',
      desk_number: 'abc',
    });

    expect(errors.desk_number).toBe('Desk number must be a number');
  });
});
