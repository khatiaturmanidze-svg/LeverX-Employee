import React, { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import CreateUserForm from './CreateUserForm';

const { addUserMock, getErrorMessageMock } = vi.hoisted(() => ({
  addUserMock: vi.fn(),
  getErrorMessageMock: vi.fn(),
}));

vi.mock('../api/createUserApi', () => ({
  useAddUserMutation: () => [addUserMock, { isLoading: false }],
}));

vi.mock('@shared/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/lib')>();
  return {
    ...actual,
    getErrorMessage: getErrorMessageMock,
  };
});

describe('CreateUserForm', () => {
  const setInputValue = (input: HTMLInputElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('Input value setter not found');
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const setSelectValue = (select: HTMLSelectElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('Select value setter not found');
    setter.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  beforeEach(() => {
    addUserMock.mockReset();
    getErrorMessageMock.mockReset();
  });

  it('shows validation errors and does not submit invalid form', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(CreateUserForm));
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(addUserMock).not.toHaveBeenCalled();
    expect(container.textContent).toContain('First name is required');
    expect(container.textContent).toContain('Email is required');

    await act(async () => {
      root.unmount();
    });
  });

  it('submits transformed payload and shows temporary password on success', async () => {
    addUserMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          message: 'employee created successfully',
          employee: { _id: '13', first_name: 'John' },
          temporaryPassword: 'Temp123!',
        }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(CreateUserForm));
    });

    await act(async () => {
      setInputValue(
        container.querySelector('#first_name') as HTMLInputElement,
        ' John ',
      );
      setInputValue(
        container.querySelector('#last_name') as HTMLInputElement,
        ' Doe ',
      );
      setSelectValue(
        container.querySelector('#role') as HTMLSelectElement,
        'HR',
      );
      setInputValue(
        container.querySelector('#department') as HTMLInputElement,
        ' Engineering ',
      );
      setInputValue(
        container.querySelector('#email') as HTMLInputElement,
        ' user@example.com ',
      );
      setInputValue(
        container.querySelector('#phone') as HTMLInputElement,
        ' +123456 ',
      );
      setInputValue(
        container.querySelector('#building') as HTMLInputElement,
        ' HQ ',
      );
      setInputValue(
        container.querySelector('#room') as HTMLInputElement,
        ' 101 ',
      );
      setInputValue(
        container.querySelector('#desk_number') as HTMLInputElement,
        '12',
      );
      setInputValue(
        container.querySelector('#zoom_id') as HTMLInputElement,
        ' zoom-id ',
      );
      setInputValue(
        container.querySelector('#zoom_link') as HTMLInputElement,
        ' https://zoom.us/j/123 ',
      );
      setInputValue(
        container.querySelector('#citizenship') as HTMLInputElement,
        ' Georgia ',
      );
      setInputValue(
        container.querySelector('#first_native_name') as HTMLInputElement,
        ' J ',
      );
      setInputValue(
        container.querySelector('#last_native_name') as HTMLInputElement,
        ' D ',
      );
      setInputValue(
        container.querySelector('#date_birth') as HTMLInputElement,
        '1995-06-15',
      );
      (container.querySelector('#isRemoteWork') as HTMLInputElement).click();
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(addUserMock).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      role: 'HR',
      department: 'Engineering',
      building: 'HQ',
      room: '101',
      desk_number: 12,
      isRemoteWork: true,
      phone: '+123456',
      email: 'user@example.com',
      zoom_id: 'zoom-id',
      zoom_link: 'https://zoom.us/j/123',
      citizenship: 'Georgia',
      first_native_name: 'J',
      last_native_name: 'D',
      date_birth: { year: 1995, month: 6, day: 15 },
      visa: [],
    });
    expect(container.textContent).toContain('Employee created successfully.');
    expect(container.textContent).toContain('Temporary password: Temp123!');

    await act(async () => {
      root.unmount();
    });
  });

  it('renders API error message when creation fails', async () => {
    const error = new Error('request failed');
    addUserMock.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });
    getErrorMessageMock.mockReturnValue('Email already exists');

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(CreateUserForm));
    });

    await act(async () => {
      setInputValue(
        container.querySelector('#first_name') as HTMLInputElement,
        'John',
      );
      setInputValue(
        container.querySelector('#last_name') as HTMLInputElement,
        'Doe',
      );
      setInputValue(
        container.querySelector('#department') as HTMLInputElement,
        'Engineering',
      );
      setInputValue(
        container.querySelector('#email') as HTMLInputElement,
        'john@example.com',
      );
      setInputValue(
        container.querySelector('#building') as HTMLInputElement,
        'HQ',
      );
      setInputValue(
        container.querySelector('#room') as HTMLInputElement,
        '101',
      );
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(getErrorMessageMock).toHaveBeenCalledWith(error);
    expect(container.textContent).toContain('Email already exists');

    await act(async () => {
      root.unmount();
    });
  });
});
