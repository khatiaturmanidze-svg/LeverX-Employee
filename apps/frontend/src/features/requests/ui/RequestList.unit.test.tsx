import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import RequestList from './RequestList';
import {
  getManagedEmployeesMock,
  invalidateTagsMock,
  useDispatchMock,
  useGetRequestsQueryMock,
  useGetUsersQueryMock,
  useParamsMock,
} from './test-mocks';

vi.mock(
  '../api/RequestsApi',
  async () => (await import('./test-mocks')).requestListApiModule,
);

vi.mock(
  '../../usersApi',
  async () => (await import('./test-mocks')).requestListUsersApiModule,
);

vi.mock(
  'react-router-dom',
  async () => (await import('./test-mocks')).requestListRouterModule,
);

vi.mock(
  'react-redux',
  async () => (await import('./test-mocks')).requestListReduxModule,
);

vi.mock(
  '@shared/lib',
  async () => (await import('./test-mocks')).requestListSharedLibModule,
);

vi.mock(
  '@shared/ui',
  async () => (await import('./test-mocks')).requestListSharedUiModule,
);

vi.mock(
  './RequestListItem',
  async () => (await import('./test-mocks')).requestListItemModule,
);

describe('RequestList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders personal requests by default and dispatches users invalidation on mount', async () => {
    const dispatch = vi.fn();
    useDispatchMock.mockReturnValue(dispatch);
    useParamsMock.mockReturnValue({ id: 'u-1' });
    useGetRequestsQueryMock.mockReturnValue({
      data: [
        {
          id: 'r-1',
          type: 'Vacation',
          start_date: '2026-06-01',
          end_date: '2026-06-05',
          note: '',
          status: 'pending',
          employeeId: 'u-1',
        },
      ],
      isLoading: false,
    });
    useGetUsersQueryMock.mockReturnValue({ data: [], isLoading: false });
    getManagedEmployeesMock.mockReturnValue([
      {
        _id: 'u-2',
        first_name: 'Team',
        last_name: 'Member',
      },
    ]);

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(RequestList));
    });

    expect(container.textContent).toContain('My leave requests');
    expect(container.textContent).toContain('r-1:Vacation:personal');
    expect(invalidateTagsMock).toHaveBeenCalledWith(['users']);
    expect(dispatch).toHaveBeenCalledWith({ type: 'invalidate' });

    await act(async () => {
      root.unmount();
    });
  });

  it('shows loading state while personal requests are loading', async () => {
    useDispatchMock.mockReturnValue(vi.fn());
    useParamsMock.mockReturnValue({ id: 'u-1' });
    useGetRequestsQueryMock.mockReturnValue({ data: [], isLoading: true });
    useGetUsersQueryMock.mockReturnValue({ data: [], isLoading: false });
    getManagedEmployeesMock.mockReturnValue([]);

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(RequestList));
    });

    expect(container.textContent).toContain('Loading requests...');
    expect(container.textContent).not.toContain('No  requests found');

    await act(async () => {
      root.unmount();
    });
  });

  it('shows loading state on team tab while users are loading', async () => {
    useDispatchMock.mockReturnValue(vi.fn());
    useParamsMock.mockReturnValue({ id: 'u-1' });
    useGetRequestsQueryMock.mockReturnValue({ data: [], isLoading: false });
    useGetUsersQueryMock.mockReturnValue({ data: [], isLoading: true });
    getManagedEmployeesMock.mockReturnValue([]);

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(RequestList));
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'team requests',
    );
    if (!teamButton) throw new Error('team requests tab not found');

    await act(async () => {
      teamButton.click();
    });

    expect(container.textContent).toContain('Team leave requests');
    expect(container.textContent).toContain('Loading requests...');
    expect(container.textContent).not.toContain('No  requests found');

    await act(async () => {
      root.unmount();
    });
  });

  it('switches to team tab and shows empty state when no team requests after loading completes', async () => {
    useDispatchMock.mockReturnValue(vi.fn());
    useParamsMock.mockReturnValue({ id: 'u-1' });
    useGetRequestsQueryMock.mockReturnValue({ data: [], isLoading: false });
    useGetUsersQueryMock.mockReturnValue({ data: [], isLoading: false });
    getManagedEmployeesMock.mockReturnValue([]);

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(RequestList));
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'team requests',
    );
    if (!teamButton) throw new Error('team requests tab not found');

    await act(async () => {
      teamButton.click();
    });

    expect(container.textContent).toContain('Team leave requests');
    expect(container.textContent).toContain('No  requests found');
    expect(container.textContent).not.toContain('Loading requests...');

    await act(async () => {
      root.unmount();
    });
  });
});
