import React from 'react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import Requests from './Requests';
import type { IEmployee } from '../types/type';
import {
  getLoggedInUserMock,
  requestsAllUsers,
  useGetHeaderPropsMock,
  useGetUsersQueryMock,
} from './test-mocks';

vi.mock(
  '../features/usersApi',
  async () => (await import('./test-mocks')).pagesUsersApiModule,
);

vi.mock('@shared/lib', async () => {
  const { getLoggedInUserMock, useGetHeaderPropsMock } =
    await import('./test-mocks');
  return {
    getLoggedInUser: getLoggedInUserMock,
    useGetHeaderProps: useGetHeaderPropsMock,
  };
});

vi.mock(
  '@shared/ui',
  async () => (await import('./test-mocks')).requestsSharedUiModule,
);

vi.mock(import('@features/requests'), async (importOriginal) => {
  const { requestsFeatureFactory } = await import('./test-mocks');
  return requestsFeatureFactory(importOriginal);
});

vi.mock(
  '@features/requests/ui/Managers',
  async () => (await import('./test-mocks')).requestsManagersModule,
);

vi.mock(
  '@features/requests/ui/RequestForm',
  async () => (await import('./test-mocks')).requestsRequestFormModule,
);

vi.mock(
  '@features/requests/ui/RequestList',
  async () => (await import('./test-mocks')).requestsRequestListModule,
);

describe('pages/Requests', () => {
  const resolveLazySections = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    useGetUsersQueryMock.mockReset();
    getLoggedInUserMock.mockReset();
    useGetHeaderPropsMock.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders with Header isAdmin=true for Admin role', async () => {
    const loggedUser: IEmployee = requestsAllUsers[0];
    useGetUsersQueryMock.mockReturnValue({ data: requestsAllUsers });
    getLoggedInUserMock.mockReturnValue(loggedUser);
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser,
      isAdmin: true,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Requests));
    });
    await resolveLazySections();

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
      ...requestsAllUsers[0],
      role: 'Employee',
      email: 'user@example.com',
    };
    useGetUsersQueryMock.mockReturnValue({ data: requestsAllUsers });
    getLoggedInUserMock.mockReturnValue(nonAdminUser);
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser: nonAdminUser,
      isAdmin: false,
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Requests));
    });
    await resolveLazySections();

    expect(container.querySelector('[data-testid="header"]')?.textContent).toBe(
      `header:${nonAdminUser.role}:false`,
    );

    await act(async () => {
      root.unmount();
    });
  });
});
