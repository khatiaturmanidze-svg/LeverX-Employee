import React from 'react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import Roles from './Roles';
import {
  getLoggedInUserMock,
  rolesAllUsers,
  useGetHeaderPropsMock,
  useGetUsersQueryMock,
  useRoleChangeMock,
} from './test-mocks';

vi.mock(
  '../features/usersApi',
  async () => (await import('./test-mocks')).pagesUsersApiModule,
);

vi.mock(
  '@shared/lib',
  async () => (await import('./test-mocks')).rolesSharedLibModule,
);

vi.mock(
  '@shared/ui',
  async () => (await import('./test-mocks')).rolesSharedUiModule,
);

vi.mock(
  '@features/role-change',
  async () => (await import('./test-mocks')).rolesFeatureModule,
);

describe('pages/Roles', () => {
  beforeEach(() => {
    useGetUsersQueryMock.mockReset();
    getLoggedInUserMock.mockReset();
    useGetHeaderPropsMock.mockReset();
    useRoleChangeMock.mockReset();
    useGetUsersQueryMock.mockReturnValue({ data: rolesAllUsers });
    getLoggedInUserMock.mockReturnValue(rolesAllUsers[0]);
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser: rolesAllUsers[0],
      isAdmin: true,
    });
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
