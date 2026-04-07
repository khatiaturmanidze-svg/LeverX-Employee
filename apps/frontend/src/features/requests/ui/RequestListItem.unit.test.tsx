import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import RequestListItem from './RequestListItem';
import {
  baseRequest,
  getDisplayStatusMock,
  invalidateUsersTagsMock,
  updateRequestMock,
  useDispatchMock,
  useGetManagerMock,
  useUpdateRequestMutationMock,
} from './test-mocks';

vi.mock(
  'react-redux',
  async () => (await import('./test-mocks')).requestListItemReduxModule,
);

vi.mock(
  '../api/RequestsApi',
  async () => (await import('./test-mocks')).requestListItemApiModule,
);

vi.mock(
  '../../usersApi',
  async () => (await import('./test-mocks')).requestListItemUsersApiModule,
);

vi.mock(
  '@shared/lib',
  async () => (await import('./test-mocks')).requestListItemSharedLibModule,
);

describe('RequestListItem', () => {
  it('renders personal mode with manager info label', () => {
    useGetManagerMock.mockReturnValue({
      first_name: 'Alice',
      last_name: 'Smith',
    });
    useUpdateRequestMutationMock.mockReturnValue([
      updateRequestMock,
      { isLoading: false },
    ]);
    getDisplayStatusMock.mockReturnValue('pending');

    const html = renderToStaticMarkup(
      React.createElement(RequestListItem, {
        request: baseRequest,
        isPersonal: true,
      }),
    );

    expect(html).toContain('Awaiting for approval');
    expect(html).toContain('Alice Smith');
    expect(html).toContain('status--pending');
  });

  it('calls approve mutation and invalidates users on approve click', async () => {
    const dispatch = vi.fn();
    useDispatchMock.mockReturnValue(dispatch);
    useGetManagerMock.mockReturnValue(undefined);
    updateRequestMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    useUpdateRequestMutationMock.mockReturnValue([
      updateRequestMock,
      { isLoading: false },
    ]);

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(
        React.createElement(RequestListItem, {
          request: baseRequest,
          isPersonal: false,
        }),
      );
    });

    const approveBtn = container.querySelector(
      '.request-btn__approve',
    ) as HTMLButtonElement;
    await act(async () => {
      approveBtn.click();
    });

    expect(updateRequestMock).toHaveBeenCalledWith({
      employeeId: 'emp-1',
      requestId: 'req-1',
      newStatus: 'approved',
    });
    expect(invalidateUsersTagsMock).toHaveBeenCalledWith(['users']);
    expect(dispatch).toHaveBeenCalledWith({ type: 'invalidate-users' });

    await act(async () => {
      root.unmount();
    });
  });

  it('disables approve/reject buttons when request is not pending', () => {
    useDispatchMock.mockReturnValue(vi.fn());
    useGetManagerMock.mockReturnValue(undefined);
    useUpdateRequestMutationMock.mockReturnValue([
      updateRequestMock,
      { isLoading: false },
    ]);

    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(RequestListItem, {
          request: { ...baseRequest, status: 'approved' },
          isPersonal: false,
        }),
      );
    });

    const approveBtn = container.querySelector(
      '.request-btn__approve',
    ) as HTMLButtonElement;
    const rejectBtn = container.querySelector(
      '.request-btn__reject',
    ) as HTMLButtonElement;

    expect(approveBtn.disabled).toBe(true);
    expect(rejectBtn.disabled).toBe(true);

    act(() => {
      root.unmount();
    });
  });
});
