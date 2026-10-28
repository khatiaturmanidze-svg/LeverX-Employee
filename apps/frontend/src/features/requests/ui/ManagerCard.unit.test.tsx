import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  beforeEach(() => {
    useGetUsersQueryMock.mockReset();
    getUserByIdMock.mockReset();
    useGetUsersQueryMock.mockReturnValue({ data: [] });
  });

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

  it('recognizes the SQL empty-manager response without rendering an image', () => {
    const html = renderToStaticMarkup(
      <ManagerCard manager={{ id: '', first_name: '', last_name: '' }} />,
    );
    expect(html).toContain('No manager assigned.');
    expect(html).not.toContain('<img');
    expect(useGetUsersQueryMock).toHaveBeenCalledWith(undefined, {
      skip: true,
    });
  });

  it('shows loading only while manager data is being fetched', () => {
    useGetUsersQueryMock.mockReturnValue({ data: [], isFetching: true });
    const html = renderToStaticMarkup(
      <ManagerCard
        manager={{ id: '1', first_name: 'Alice', last_name: 'Smith' }}
      />,
    );
    expect(html).toContain('Loading manager details...');
    expect(html).toContain('role="status"');
    expect(html).not.toContain('<img');
  });

  it('shows a completed missing lookup instead of an indefinite image skeleton', () => {
    const html = renderToStaticMarkup(
      <ManagerCard
        manager={{ id: 'missing', first_name: 'Alice', last_name: 'Smith' }}
      />,
    );
    expect(html).toContain('Manager details are unavailable.');
    expect(html).not.toContain('Loading manager');
    expect(html).not.toContain('<img');
  });

  it('shows query failures instead of an image without a source', () => {
    useGetUsersQueryMock.mockReturnValue({ isError: true });
    const html = renderToStaticMarkup(
      <ManagerCard
        manager={{ id: '1', first_name: 'Alice', last_name: 'Smith' }}
      />,
    );
    expect(html).toContain('Could not load manager details.');
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('<img');
  });

  it('keeps cached details visible during background refetch and supplies a missing avatar', () => {
    useGetUsersQueryMock.mockReturnValue({ isFetching: true });
    getUserByIdMock.mockReturnValue({
      user_avatar: '',
      first_name: 'Alice',
      last_name: 'Smith',
      department: 'HR',
    });
    const html = renderToStaticMarkup(
      <ManagerCard manager={{ id: '1', first_name: '', last_name: '' }} />,
    );
    expect(html).toContain('Alice Smith');
    expect(html).toContain('/users/dumplinh.jpg');
    expect(html).not.toContain('Loading manager details');
  });
});
