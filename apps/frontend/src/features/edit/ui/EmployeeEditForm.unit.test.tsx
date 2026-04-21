import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { EmployeeEditForm } from './EmployeeEditForm';
import { IEmployee } from '../../../types/type';
import * as usersApi from '@/features/usersApi';

const baseUser: IEmployee = {
  _id: 'emp-1',
  role: 'employee',
  user_avatar: '',
  first_name: 'John',
  last_name: 'Doe',
  department: 'IT',
  building: 'B',
  room: '101',
  desk_number: 7,
  isRemoteWork: false,
  phone: '+1234567890',
  email: 'test@example.com',
  zoom_id: 'zoom123',
  zoom_link: 'https://zoom.us/j/123',
  citizenship: 'US',
  first_native_name: 'John',
  last_native_name: 'Doe',
  date_birth: { year: 1990, month: 5, day: 15 },
  manager: { id: 'manager-1', first_name: 'Alice', last_name: 'Smith' },
};

describe('EmployeeEditForm', () => {
  const updateEmployeeMock = vi.fn();

  it('renders sections/buttons and calls onCancel', async () => {
    const onCancel = vi.fn();

    const container = document.createElement('div');
    const root = createRoot(container);

    vi.spyOn(usersApi, 'useUpdateEmployeeMutation').mockReturnValue([
      updateEmployeeMock,
      { isLoading: false },
    ] as unknown as ReturnType<typeof usersApi.useUpdateEmployeeMutation>);

    await act(async () => {
      root.render(
        React.createElement(EmployeeEditForm, {
          user: baseUser,
          onCancel,
        }),
      );
    });

    expect(container.textContent).toContain('General Info');
    expect(container.textContent).toContain('Contacts');
    expect(container.textContent).toContain('Travel Info');

    const cancelBtn = container.querySelector(
      'button.details-section__row-cancel',
    ) as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();

    await act(async () => {
      cancelBtn.click();
    });
    expect(onCancel).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });

  it('shows validation error and does not call updateEmployee when email is invalid', async () => {
    const onCancel = vi.fn();

    const container = document.createElement('div');
    const root = createRoot(container);
    updateEmployeeMock.mockReset();

    vi.spyOn(usersApi, 'useUpdateEmployeeMutation').mockReturnValue([
      updateEmployeeMock,
      { isLoading: false },
    ] as unknown as ReturnType<typeof usersApi.useUpdateEmployeeMutation>);

    const invalidEmailUser: IEmployee = {
      ...baseUser,
      email: '',
    };

    await act(async () => {
      root.render(
        React.createElement(EmployeeEditForm, {
          user: invalidEmailUser,
          onCancel,
        }),
      );
    });

    const form = container.querySelector(
      'form.employee-edit-form',
    ) as HTMLFormElement;
    expect(form).toBeTruthy();

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(updateEmployeeMock).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Email is required');

    await act(async () => {
      root.unmount();
    });
  });

  it('submits payload with correctly mapped fields and closes on success', async () => {
    const onCancel = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);
    updateEmployeeMock.mockReset();
    updateEmployeeMock.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });

    vi.spyOn(usersApi, 'useUpdateEmployeeMutation').mockReturnValue([
      updateEmployeeMock,
      { isLoading: false },
    ] as unknown as ReturnType<typeof usersApi.useUpdateEmployeeMutation>);

    await act(async () => {
      root.render(
        React.createElement(EmployeeEditForm, {
          user: baseUser,
          onCancel,
        }),
      );
    });

    const form = container.querySelector(
      'form.employee-edit-form',
    ) as HTMLFormElement;
    expect(form).toBeTruthy();

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(updateEmployeeMock).toHaveBeenCalledTimes(1);
    expect(updateEmployeeMock).toHaveBeenCalledWith({
      id: 'emp-1',
      update: {
        department: baseUser.department,
        building: baseUser.building,
        room: baseUser.room,
        desk_number: 7,
        phone: baseUser.phone,
        email: baseUser.email,
        zoom_id: baseUser.zoom_id,
        zoom_link: baseUser.zoom_link,
        citizenship: baseUser.citizenship,
        first_native_name: baseUser.first_native_name,
        last_native_name: baseUser.last_native_name,
        date_birth: { year: 1990, month: 5, day: 15 },
        manager: 'manager-1',
      },
    });
    expect(onCancel).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });
});
