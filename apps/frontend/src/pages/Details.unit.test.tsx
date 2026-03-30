import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Details from './Details';
import { EmployeeUpdate, IEmployee } from '../types/type';

const { useParamsMock, useGetUsersQueryMock, useGetEmployeeDetailsQueryMock } =
  vi.hoisted(() => ({
    useParamsMock: vi.fn(),
    useGetUsersQueryMock: vi.fn(),
    useGetEmployeeDetailsQueryMock: vi.fn(),
  }));

const { useUpdateEmployeeMutationMock, getLoggedInUserMock, canEditMock } =
  vi.hoisted(() => ({
    useUpdateEmployeeMutationMock: vi.fn(),
    getLoggedInUserMock: vi.fn(),
    canEditMock: vi.fn(),
  }));

const updateEmployeeMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: useParamsMock,
}));

vi.mock('../features/usersApi', () => ({
  useGetUsersQuery: useGetUsersQueryMock,
  useGetEmployeeDetailsQuery: useGetEmployeeDetailsQueryMock,
  useUpdateEmployeeMutation: useUpdateEmployeeMutationMock,
}));

vi.mock('../shared/lib/core', () => ({
  getLoggedInUser: getLoggedInUserMock,
  canEdit: canEditMock,
}));

vi.mock('../shared/ui/Header', () => ({
  Header: () => React.createElement('header', null, 'Header'),
}));

vi.mock('../shared/ui/AvatarSection', () => ({
  __esModule: true,
  default: ({
    canEdit,
    onEditClick,
    onCopyLink,
  }: {
    canEdit: boolean;
    onEditClick: () => void;
    onCopyLink: () => void;
  }) =>
    React.createElement('section', { 'data-testid': 'avatar' }, [
      canEdit
        ? React.createElement(
            'button',
            {
              key: 'edit',
              type: 'button',
              className: 'avatar-section__edit',
              onClick: onEditClick,
            },
            'edit',
          )
        : null,
      React.createElement(
        'button',
        {
          key: 'copy',
          type: 'button',
          className: 'avatar-section__copy',
          onClick: onCopyLink,
        },
        'Copy link',
      ),
    ]),
}));

vi.mock('../shared/ui/EmployeeView', () => ({
  EmployeeView: () =>
    React.createElement(
      'div',
      { 'data-testid': 'employee-view' },
      'EmployeeView',
    ),
}));

vi.mock('../features/edit/ui/EmployeeEditForm', () => ({
  EmployeeEditForm: ({
    onCancel,
    onSaveSuccess,
  }: {
    onCancel: () => void;
    onSaveSuccess: (updated: EmployeeUpdate) => Promise<void> | void;
  }) =>
    React.createElement('div', { 'data-testid': 'employee-edit-form' }, [
      React.createElement(
        'button',
        { key: 'cancel', type: 'button', onClick: onCancel },
        'Cancel',
      ),
      React.createElement(
        'button',
        {
          key: 'save-success',
          type: 'button',
          onClick: () =>
            onSaveSuccess({
              department: 'IT-Updated',
            }),
        },
        'Save success',
      ),
    ]),
}));

describe('pages/Details', () => {
  const loggedUser: IEmployee = {
    _id: 'logged-1',
    role: 'Admin',
    user_avatar: '',
    first_name: 'Admin',
    last_name: 'User',
    department: 'IT',
    building: 'B',
    room: '1',
    desk_number: 1,
    isRemoteWork: false,
    phone: '+1',
    email: 'admin@example.com',
    zoom_id: 'z',
    zoom_link: 'link',
    citizenship: 'US',
  };

  const viewedEmployee: IEmployee = {
    _id: 'emp-1',
    role: 'employee',
    user_avatar: '',
    first_name: 'Jane',
    last_name: 'Doe',
    department: 'IT',
    building: 'B',
    room: '101',
    desk_number: 7,
    isRemoteWork: false,
    phone: '+123',
    email: 'jane@example.com',
    zoom_id: 'zoom123',
    zoom_link: 'https://zoom.us/j/123',
    citizenship: 'US',
    first_native_name: 'Jane',
    last_native_name: 'Doe',
    date_birth: { year: 1990, month: 5, day: 15 },
    manager: { id: 'm-1', first_name: 'A', last_name: 'B' },
    visa: [],
  };

  const setupBaseMocks = () => {
    useParamsMock.mockReturnValue({ id: viewedEmployee._id });
    useGetUsersQueryMock.mockReturnValue({ data: [loggedUser] });
    getLoggedInUserMock.mockReturnValue(loggedUser);
    useGetEmployeeDetailsQueryMock.mockReturnValue({
      data: viewedEmployee,
      isLoading: false,
      isError: false,
    });

    updateEmployeeMock.mockReset();
    updateEmployeeMock.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    useUpdateEmployeeMutationMock.mockReturnValue([updateEmployeeMock]);
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    updateEmployeeMock.mockReset();
    updateEmployeeMock.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    useUpdateEmployeeMutationMock.mockReturnValue([updateEmployeeMock]);
    canEditMock.mockReset();
    getLoggedInUserMock.mockReset();
    useParamsMock.mockReset();
    useGetUsersQueryMock.mockReset();
    useGetEmployeeDetailsQueryMock.mockReset();
    // useUpdateEmployeeMutationMock is set above to avoid crashes on destructuring.
  });

  it('renders loading state while employee details are loading', async () => {
    useParamsMock.mockReturnValue({ id: viewedEmployee._id });
    useGetUsersQueryMock.mockReturnValue({ data: [loggedUser] });
    getLoggedInUserMock.mockReturnValue(loggedUser);

    useGetEmployeeDetailsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Details));
    });

    expect(container.textContent).toContain('Loading Employee Details...');
    expect(container.textContent).not.toContain('Employee not found');

    await act(async () => {
      root.unmount();
    });
  });

  it('renders "Employee not found" when employee details query errors', async () => {
    useParamsMock.mockReturnValue({ id: viewedEmployee._id });
    useGetUsersQueryMock.mockReturnValue({ data: [loggedUser] });
    getLoggedInUserMock.mockReturnValue(loggedUser);

    useGetEmployeeDetailsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Details));
    });

    expect(container.textContent).toContain('Employee not found');

    await act(async () => {
      root.unmount();
    });
  });

  it('renders view mode and switches to edit mode when edit is clicked', async () => {
    setupBaseMocks();
    canEditMock.mockReturnValue(true);

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Details));
    });

    expect(
      container.querySelector('[data-testid="employee-view"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="employee-edit-form"]'),
    ).toBeFalsy();

    const editBtn = container.querySelector(
      'button.avatar-section__edit',
    ) as HTMLButtonElement | null;
    expect(editBtn).toBeTruthy();

    await act(async () => {
      editBtn!.click();
    });

    expect(
      container.querySelector('[data-testid="employee-edit-form"]'),
    ).toBeTruthy();

    await act(async () => {
      root.unmount();
    });
  });

  it('copies link when clicked and then saves successfully in edit mode', async () => {
    setupBaseMocks();
    canEditMock.mockReturnValue(true);
    localStorage.setItem('loggedInUser', 'admin@example.com');

    const writeTextMock = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Details));
    });

    const copyBtn = container.querySelector(
      'button.avatar-section__copy',
    ) as HTMLButtonElement;

    await act(async () => {
      copyBtn.click();
    });

    expect(writeTextMock).toHaveBeenCalledWith(window.location.href);

    const editBtn = container.querySelector(
      'button.avatar-section__edit',
    ) as HTMLButtonElement;

    await act(async () => {
      editBtn.click();
    });

    const saveBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Save success',
    ) as HTMLButtonElement | undefined;
    if (!saveBtn) throw new Error('Save success button not found');

    await act(async () => {
      saveBtn.click();
    });

    expect(updateEmployeeMock).toHaveBeenCalledWith({
      id: viewedEmployee._id,
      update: { department: 'IT-Updated' },
    });

    // After save succeeds, Details should exit edit mode.
    expect(
      container.querySelector('[data-testid="employee-view"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="employee-edit-form"]'),
    ).toBeFalsy();

    await act(async () => {
      root.unmount();
    });
  });
});
