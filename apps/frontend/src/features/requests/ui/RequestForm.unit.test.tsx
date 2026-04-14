import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import RequestForm from './RequestForm';
import {
  addRequestMock,
  getLoggedInUserMock,
  useAddRequestMutationMock,
  useGetUsersQueryMock,
  validateRequestMock,
} from './test-mocks';

vi.mock(
  '../../usersApi',
  async () => (await import('./test-mocks')).requestFormUsersApiModule,
);

vi.mock(
  '../api/RequestsApi',
  async () => (await import('./test-mocks')).requestFormApiModule,
);

vi.mock(
  '@shared/lib',
  async () => (await import('./test-mocks')).requestFormSharedLibModule,
);

describe('RequestForm', () => {
  it('shows validation errors and does not call submit mutation', async () => {
    useGetUsersQueryMock.mockReturnValue({ data: [] });
    addRequestMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    useAddRequestMutationMock.mockReturnValue([
      addRequestMock,
      { isLoading: false, isError: false, error: null },
    ]);
    validateRequestMock.mockReturnValue({
      start_date: 'Start date is required',
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(RequestForm));
    });

    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(validateRequestMock).toHaveBeenCalledTimes(1);
    expect(addRequestMock).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Start date is required');

    await act(async () => {
      root.unmount();
    });
  });

  it('submits request when validation passes and user is found', async () => {
    useGetUsersQueryMock.mockReturnValue({ data: [{ _id: 'u-1' }] });
    addRequestMock.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'r-1' }),
    });
    useAddRequestMutationMock.mockReturnValue([
      addRequestMock,
      { isLoading: false, isError: false, error: null },
    ]);
    validateRequestMock.mockReturnValue({});
    getLoggedInUserMock.mockReturnValue({ _id: 'u-1' });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(RequestForm));
    });

    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(addRequestMock).toHaveBeenCalledTimes(1);
    expect(addRequestMock).toHaveBeenCalledWith({
      employeeId: 'u-1',
      body: {
        employeeId: '',
        type: 'Vacation',
        start_date: '',
        end_date: '',
        note: '',
        status: 'pending',
      },
    });

    await act(async () => {
      root.unmount();
    });
  });
});
