import { describe, it, expect } from 'vitest';
import { validateEmployeeForm } from './helpers';
import { EmployeeFormState } from '../model/state.types';

describe('validateEmployeeForm', () => {
  const validFormData: EmployeeFormState = {
    department: 'IT',
    building: 'A',
    room: '101',
    desk_number: '5',
    phone: '+1234567890',
    email: 'test@example.com',
    zoom_id: 'zoom123',
    zoom_link: 'https://zoom.us/j/123',
    citizenship: 'US',
    first_native_name: 'John',
    last_native_name: 'Doe',
    date_birth: '1990-05-15',
    manager_id: 'manager1',
    visas: [],
  };

  it('should return empty errors for valid form data', () => {
    const errors = validateEmployeeForm(validFormData);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should require department field', () => {
    const formData = { ...validFormData, department: '' };
    const errors = validateEmployeeForm(formData);
    expect(errors.department).toBe('Department is required');
  });

  it('should require email field', () => {
    const formData = { ...validFormData, email: '' };
    const errors = validateEmployeeForm(formData);
    expect(errors.email).toBe('Email is required');
  });

  it('should validate email format', () => {
    const invalidEmails = ['invalid', 'test@', '@example.com', 'test@example'];
    invalidEmails.forEach((email) => {
      const formData = { ...validFormData, email };
      const errors = validateEmployeeForm(formData);
      expect(errors.email).toBe('Invalid email');
    });
  });

  it('should accept valid email formats', () => {
    const validEmails = [
      'test@example.com',
      'user+tag@domain.co.uk',
      'name.surname@company.org',
    ];
    validEmails.forEach((email) => {
      const formData = { ...validFormData, email };
      const errors = validateEmployeeForm(formData);
      expect(errors.email).toBeUndefined();
    });
  });

  it('should validate desk number as numeric', () => {
    const formData = { ...validFormData, desk_number: 'abc' };
    const errors = validateEmployeeForm(formData);
    expect(errors.desk_number).toBe('Desk number must be a number');
  });

  it('should allow empty desk number', () => {
    const formData = { ...validFormData, desk_number: '' };
    const errors = validateEmployeeForm(formData);
    expect(errors.desk_number).toBeUndefined();
  });

  it('should allow numeric desk numbers', () => {
    const formData = { ...validFormData, desk_number: '123' };
    const errors = validateEmployeeForm(formData);
    expect(errors.desk_number).toBeUndefined();
  });

  it('should validate date of birth format', () => {
    const invalidDates = ['1990-13-01', '1990-01-32', '1800-05-15', '90-5-15'];
    invalidDates.forEach((date) => {
      const formData = { ...validFormData, date_birth: date };
      const errors = validateEmployeeForm(formData);
      expect(errors.date_birth).toBe('input format should be year-month-day');
    });
  });

  it('should accept valid date of birth', () => {
    const validDates = ['1990-01-01', '2000-12-31', '1950-06-15'];
    validDates.forEach((date) => {
      const formData = { ...validFormData, date_birth: date };
      const errors = validateEmployeeForm(formData);
      expect(errors.date_birth).toBeUndefined();
    });
  });

  it('should allow empty date of birth', () => {
    const formData = { ...validFormData, date_birth: '' };
    const errors = validateEmployeeForm(formData);
    expect(errors.date_birth).toBeUndefined();
  });

  it('should require visa issuing country', () => {
    const formData = {
      ...validFormData,
      visas: [
        { issuing_country: '', type: 'tourist', start_date: '', end_date: '' },
      ],
    };
    const errors = validateEmployeeForm(formData);
    expect(errors.visa_0_country).toBe('Required');
  });

  it('should require visa type', () => {
    const formData = {
      ...validFormData,
      visas: [
        { issuing_country: 'US', type: '', start_date: '', end_date: '' },
      ],
    };
    const errors = validateEmployeeForm(formData);
    expect(errors.visa_0_type).toBe('Required');
  });

  it('should validate multiple visas', () => {
    const formData = {
      ...validFormData,
      visas: [
        { issuing_country: '', type: 'tourist', start_date: '', end_date: '' },
        { issuing_country: 'UK', type: '', start_date: '', end_date: '' },
      ],
    };
    const errors = validateEmployeeForm(formData);
    expect(errors.visa_0_country).toBe('Required');
    expect(errors.visa_1_type).toBe('Required');
  });

  it('should allow valid visas', () => {
    const formData = {
      ...validFormData,
      visas: [
        {
          issuing_country: 'US',
          type: 'tourist',
          start_date: '2023-01-01',
          end_date: '2023-12-31',
        },
      ],
    };
    const errors = validateEmployeeForm(formData);
    expect(errors.visa_0_country).toBeUndefined();
    expect(errors.visa_0_type).toBeUndefined();
  });

  it('should return multiple errors at once', () => {
    const formData = {
      ...validFormData,
      department: '',
      email: 'invalid-email',
      desk_number: 'notanumber',
      date_birth: '1800-01-01',
    };
    const errors = validateEmployeeForm(formData);
    expect(Object.keys(errors).length).toBeGreaterThan(1);
    expect(errors.department).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.desk_number).toBeDefined();
    expect(errors.date_birth).toBeDefined();
  });
});
