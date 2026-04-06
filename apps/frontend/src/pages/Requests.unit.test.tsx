import React from 'react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import Requests from './Requests';
import type { IEmployee } from '../types/type';

const { useHeaderPropsMock } = vi.hoisted(() => ({
  useHeaderPropsMock: vi.fn(),
}));

vi.mock('@shared/lib', () => ({
  useHeaderProps: useHeaderPropsMock,
}));

vi.mock('@shared/ui', () => ({
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

vi.mock('@features/requests', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@features/requests')>();
  return {
    ...actual,
    Managers: ({ loggedInUser }: { loggedInUser: IEmployee | undefined }) =>
      React.createElement(
        'div',
        { 'data-testid': 'managers' },
        loggedInUser ? `managers:${loggedInUser.email}` : 'managers:no-user',
      ),
    RequestForm: () =>
      React.createElement('div', { 'data-testid': 'request-form' }),
    RequestList: () =>
      React.createElement('div', { 'data-testid': 'request-list' }),
  };
});

describe('pages/Requests', () => {
  const allUsers: IEmployee[] = [
    {
      _id: 'u-1',
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
    },
  ];

  beforeEach(() => {
    useHeaderPropsMock.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders with Header isAdmin=true for Admin role', async () => {
    const loggedUser: IEmployee = allUsers[0];
    useHeaderPropsMock.mockReturnValue({
      loggedInUser: loggedUser,
      isAdmin: true,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Requests));
    });

    expect(container.querySelector('[data-testid="header"]')?.textContent).toBe(
      `header:${loggedUser.role}:true`,
    );
    expect(
      container.querySelector('[data-testid="managers"]')?.textContent,
    ).toContain(loggedUser.email);
    expect(
      container.querySelector('[data-testid="request-form"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="request-list"]'),
    ).toBeTruthy();

    await act(async () => {
      root.unmount();
    });
  });

  it('renders with Header isAdmin=false for non-admin role', async () => {
    const nonAdminUser: IEmployee = {
      ...allUsers[0],
      role: 'Employee',
      email: 'user@example.com',
    };
    useHeaderPropsMock.mockReturnValue({
      loggedInUser: nonAdminUser,
      isAdmin: false,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Requests));
    });

    expect(container.querySelector('[data-testid="header"]')?.textContent).toBe(
      `header:${nonAdminUser.role}:false`,
    );

    await act(async () => {
      root.unmount();
    });
  });
});
