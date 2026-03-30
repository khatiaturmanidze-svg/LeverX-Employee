import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import RequestList from './RequestList';

const {
  useGetRequestsQueryMock,
  useGetUsersQueryMock,
  useParamsMock,
  useDispatchMock,
  getManagedEmployeesMock,
  invalidateTagsMock,
} = vi.hoisted(() => ({
  useGetRequestsQueryMock: vi.fn(),
  useGetUsersQueryMock: vi.fn(),
  useParamsMock: vi.fn(),
  useDispatchMock: vi.fn(),
  getManagedEmployeesMock: vi.fn(),
  invalidateTagsMock: vi.fn(() => ({ type: 'invalidate' })),
}));

vi.mock('../api/RequestsApi', () => ({
  useGetRequestsQuery: useGetRequestsQueryMock,
}));

vi.mock('../../usersApi', () => ({
  useGetUsersQuery: useGetUsersQueryMock,
  usersApi: {
    util: {
      invalidateTags: invalidateTagsMock,
    },
  },
}));

vi.mock('react-router-dom', () => ({
  useParams: useParamsMock,
}));

vi.mock('react-redux', () => ({
  useDispatch: useDispatchMock,
}));

vi.mock('@shared/lib', () => ({
  getManagedEmployees: getManagedEmployeesMock,
}));

vi.mock('@shared/ui', () => ({
  TabGroup: ({
    tabs,
  }: {
    tabs: { id: string; label: string; onClick: () => void }[];
  }) =>
    React.createElement(
      'div',
      null,
      tabs.map((tab) =>
        React.createElement(
          'button',
          { key: tab.id, type: 'button', onClick: tab.onClick },
          tab.label,
        ),
      ),
    ),
}));

vi.mock('./RequestListItem', () => ({
  default: ({
    request,
    isPersonal,
  }: {
    request: { id: string; type: string };
    isPersonal: boolean;
  }) =>
    React.createElement(
      'div',
      { className: 'request-item-mock' },
      `${request.id}:${request.type}:${isPersonal ? 'personal' : 'team'}`,
    ),
}));

describe('RequestList', () => {
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
    });
    useGetUsersQueryMock.mockReturnValue({ data: [] });
    getManagedEmployeesMock.mockReturnValue([]);

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

  it('switches to team tab and shows empty state when no team requests', async () => {
    useDispatchMock.mockReturnValue(vi.fn());
    useParamsMock.mockReturnValue({ id: 'u-1' });
    useGetRequestsQueryMock.mockReturnValue({ data: [] });
    useGetUsersQueryMock.mockReturnValue({ data: [] });
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

    await act(async () => {
      root.unmount();
    });
  });
});
