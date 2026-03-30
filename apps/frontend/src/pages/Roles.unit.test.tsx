import React from 'react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import Roles from './Roles';
import type { IEmployee } from '../types/type';

const { useGetUsersQueryMock, getLoggedInUserMock, useRoleChangeMock } =
  vi.hoisted(() => ({
    useGetUsersQueryMock: vi.fn(),
    getLoggedInUserMock: vi.fn(),
    useRoleChangeMock: vi.fn(),
  }));

vi.mock('../features/usersApi', () => ({
  useGetUsersQuery: useGetUsersQueryMock,
}));

vi.mock('../shared/lib/core', () => ({
  getLoggedInUser: getLoggedInUserMock,
}));

vi.mock('../shared/lib/customHooks', () => {
  const actual = vi.importActual('../shared/lib/customHooks') as unknown;
  return {
    ...(actual as object),
    useRoleChange: useRoleChangeMock,
    useFilteredItems: (
      users: IEmployee[],
      value: string,
      filterFn: (user: IEmployee, term: string) => boolean,
    ) => users.filter((u) => filterFn(u, value)),
  };
});

vi.mock('../shared/ui/Header', () => ({
  Header: ({
    loggedInUser,
    isAdmin,
  }: {
    loggedInUser: IEmployee | null;
    isAdmin?: boolean;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'header' },
      `header:${loggedInUser ? loggedInUser.role : 'no-user'}:${String(
        isAdmin,
      )}`,
    ),
}));

vi.mock('../features/role-change/ui/RolesEmployee', () => ({
  RolesEmployee: ({
    user,
    isAdmin,
    onRoleChange,
  }: {
    user: IEmployee;
    isAdmin: boolean;
    onRoleChange: (id: string, newRole: string) => void;
  }) =>
    React.createElement('div', { 'data-testid': 'role-employee' }, [
      `${user.first_name} ${user.last_name}:admin=${String(isAdmin)}`,
      React.createElement(
        'button',
        {
          key: 'btn',
          type: 'button',
          onClick: () => onRoleChange(user._id, 'HR'),
        },
        'change',
      ),
    ]),
}));

describe('pages/Roles', () => {
  const allUsers: IEmployee[] = [
    {
      _id: 'u-1',
      role: 'Admin',
      user_avatar: '',
      first_name: 'Jane',
      last_name: 'Doe',
      department: 'IT',
      building: 'B',
      room: '1',
      desk_number: 1,
      isRemoteWork: false,
      phone: '+1',
      email: 'jane@example.com',
      zoom_id: 'z1',
      zoom_link: 'link',
      citizenship: 'US',
      manager: undefined,
      visa: [],
    },
    {
      _id: 'u-2',
      role: 'Employee',
      user_avatar: '',
      first_name: 'John',
      last_name: 'Smith',
      department: 'HR',
      building: 'B',
      room: '2',
      desk_number: 2,
      isRemoteWork: false,
      phone: '+2',
      email: 'john@example.com',
      zoom_id: 'z2',
      zoom_link: 'link',
      citizenship: 'US',
      manager: undefined,
      visa: [],
    },
  ];

  beforeEach(() => {
    useGetUsersQueryMock.mockReset();
    getLoggedInUserMock.mockReset();
    useRoleChangeMock.mockReset();
    useGetUsersQueryMock.mockReturnValue({ data: allUsers });
    getLoggedInUserMock.mockReturnValue(allUsers[0]);
    useRoleChangeMock.mockReturnValue({
      handleRoleChange: vi.fn(),
      error: null,
      isAdmin: true,
      isLoading: false,
    });
    localStorage.clear();
    sessionStorage.clear();
  });

  const setInputValue = (input: HTMLInputElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('Input value setter not found');
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('sets header isAdmin=true when logged-in user is Admin', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Roles));
    });

    expect(container.querySelector('[data-testid="header"]')?.textContent).toBe(
      'header:Admin:true',
    );

    expect(
      container.querySelectorAll('[data-testid="role-employee"]'),
    ).toHaveLength(2);

    await act(async () => {
      root.unmount();
    });
  });

  it('filters roles list when typing in search input', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Roles));
    });

    const searchInput = container.querySelector(
      'input.section-roles__search',
    ) as HTMLInputElement;
    expect(searchInput).toBeTruthy();

    await act(async () => {
      setInputValue(searchInput, 'Ja');
    });

    const items = container.querySelectorAll('[data-testid="role-employee"]');
    expect(items).toHaveLength(1);
    expect(container.textContent).toContain('Jane Doe');

    await act(async () => {
      root.unmount();
    });
  });

  it('renders error text when useRoleChange returns an error', async () => {
    useRoleChangeMock.mockReturnValue({
      handleRoleChange: vi.fn(),
      error: 'permission denied. only Admins can change roles.',
      isAdmin: false,
      isLoading: false,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Roles));
    });

    const errorNode = container.querySelector(
      'p.section-roles__error',
    ) as HTMLParagraphElement | null;

    expect(errorNode?.textContent).toBe(
      'permission denied. only Admins can change roles.',
    );

    await act(async () => {
      root.unmount();
    });
  });
});
