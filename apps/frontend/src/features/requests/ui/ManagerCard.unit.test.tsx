import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ManagerCard from './ManagerCard';
import { getUserByIdMock, useGetUsersQueryMock } from './test-mocks';

vi.mock(
  '../../usersApi',
  async () => (await import('./test-mocks')).managerCardUsersApiModule,
);

vi.mock(
  '@shared/lib',
  async () => (await import('./test-mocks')).managerCardSharedLibModule,
);

describe('ManagerCard', () => {
  it('shows empty state when manager is missing', () => {
    useGetUsersQueryMock.mockReturnValue({ data: [] });
    getUserByIdMock.mockReturnValue(undefined);

    const html = renderToStaticMarkup(
      React.createElement(ManagerCard, { manager: undefined }),
    );

    expect(html).toContain('No manager assigned.');
  });

  it('renders manager details when manager exists', () => {
    useGetUsersQueryMock.mockReturnValue({ data: [{ _id: '1' }] });
    getUserByIdMock.mockReturnValue({
      user_avatar: '/img.png',
      first_name: 'Alice',
      last_name: 'Smith',
      department: 'HR',
    });

    const html = renderToStaticMarkup(
      React.createElement(ManagerCard, {
        manager: { id: '1', first_name: 'Alice', last_name: 'Smith' },
      }),
    );

    expect(html).toContain('manager of user');
    expect(html).toContain('Alice Smith');
    expect(html).toContain('HR');
  });
});
