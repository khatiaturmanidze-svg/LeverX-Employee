import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IRequestData } from '../model/state.types';
import {
  buildRequestPayload,
  getInitialState,
  getRequestFormState,
  submitRequest,
} from './helpers';
import { getErrorMessageMock, validateRequestMock } from '../ui/test-mocks';

type AddRequest = Parameters<typeof submitRequest>[2];

vi.mock(
  '@shared/lib',
  async () => (await import('../ui/test-mocks')).requestFormSharedLibModule,
);

const request: IRequestData = {
  id: 'req-1',
  type: 'Vacation',
  start_date: '2026-06-01',
  end_date: '2026-06-05',
  note: 'Family trip',
  status: 'pending',
  employeeId: 'emp-1',
};

describe('requests helpers', () => {
  beforeEach(() => {
    validateRequestMock.mockReset();
    getErrorMessageMock.mockReset();
  });

  it('creates editable request form state from a request', () => {
    expect(getRequestFormState(request)).toEqual(request);
    expect(getInitialState(request)).toEqual({ formData: request });
  });

  it('builds a create payload without the request id', () => {
    expect(buildRequestPayload(request)).toEqual({
      type: 'Vacation',
      start_date: '2026-06-01',
      end_date: '2026-06-05',
      note: 'Family trip',
      status: 'pending',
      employeeId: 'emp-1',
    });
  });

  it('returns validation errors without calling the mutation', async () => {
    const addRequest = vi.fn();
    validateRequestMock.mockReturnValue({
      start_date: 'Start date is required',
    });

    await expect(
      submitRequest(request, 'emp-1', addRequest as unknown as AddRequest),
    ).resolves.toEqual({
      errors: { start_date: 'Start date is required' },
      statusMessage: '',
      statusType: null,
    });
    expect(addRequest).not.toHaveBeenCalled();
  });

  it('returns a submit error when no user id is available', async () => {
    const addRequest = vi.fn();
    validateRequestMock.mockReturnValue({});

    await expect(
      submitRequest(request, '', addRequest as unknown as AddRequest),
    ).resolves.toEqual({
      errors: { submit: 'User not found' },
      statusMessage: 'User not found',
      statusType: 'error',
    });
    expect(addRequest).not.toHaveBeenCalled();
  });

  it('submits a valid request and returns success state', async () => {
    const addRequest = vi.fn(() => ({
      unwrap: () => Promise.resolve({ id: 'req-2' }),
    }));
    validateRequestMock.mockReturnValue({});

    await expect(
      submitRequest(request, 'emp-1', addRequest as unknown as AddRequest),
    ).resolves.toEqual({
      errors: {},
      statusMessage: 'Request added successfully',
      statusType: 'success',
    });
    expect(addRequest).toHaveBeenCalledWith({
      employeeId: 'emp-1',
      body: buildRequestPayload(request),
    });
  });

  it('maps mutation errors into an error submit state', async () => {
    const error = new Error('network');
    const addRequest = vi.fn(() => ({
      unwrap: () => Promise.reject(error),
    }));
    validateRequestMock.mockReturnValue({});
    getErrorMessageMock.mockReturnValue('Could not save request');

    await expect(
      submitRequest(request, 'emp-1', addRequest as unknown as AddRequest),
    ).resolves.toEqual({
      errors: { submit: 'Could not save request' },
      statusMessage: 'Could not save request',
      statusType: 'error',
    });
    expect(getErrorMessageMock).toHaveBeenCalledWith(error);
  });
});
