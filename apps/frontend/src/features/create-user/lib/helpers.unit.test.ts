import { describe, expect, it } from 'vitest';
import {
  initialState,
  initialSubmitState,
  validateCreateUserForm,
  buildCreateUserPayload,
} from './helpers';

describe('create-user helpers', () => {
  it('submits date-only visa input and validates calendar ranges', () => {
    const visa = {
      issuing_country: ' Japanese ',
      type: ' Work ',
      start_date: '2024-02-29',
      end_date: '2027-10-01',
    };
    const form = { ...initialState.formData, visas: [visa] };
    expect(buildCreateUserPayload(form).visa).toEqual([
      { ...visa, issuing_country: 'Japanese', type: 'Work' },
    ]);
    expect(validateCreateUserForm(form).visa_0_start_date).toBeUndefined();
    expect(
      validateCreateUserForm({
        ...form,
        visas: [{ ...visa, start_date: '2026-02-30' }],
      }).visa_0_start_date,
    ).toBeDefined();
    expect(
      validateCreateUserForm({
        ...form,
        visas: [{ ...visa, start_date: '2028-10-01' }],
      }).visa_0_end_date,
    ).toBeDefined();
  });
  it('provides expected initial state', () => {
    expect(initialState.formData.first_name).toBe('');
    expect(initialState.formData.role).toBe('Employee');
    expect(initialState.formData.isRemoteWork).toBe(false);
    expect(initialState.formData.visas).toEqual([]);
  });

  it('provides expected initial submit state', () => {
    expect(initialSubmitState.errors).toEqual({});
    expect(initialSubmitState.statusMessage).toBe('');
    expect(initialSubmitState.statusType).toBeNull();
    expect(initialSubmitState.temporaryPassword).toBe('');
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
