import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from './authApi';
import { usersApi } from './usersApi';
import { getErrorMessage } from '../shared/lib/core';

const { baseQueryMock } = vi.hoisted(() => ({ baseQueryMock: vi.fn() }));

vi.mock('@reduxjs/toolkit/query/react', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@reduxjs/toolkit/query/react')>();
  return { ...actual, fetchBaseQuery: () => baseQueryMock };
});

function createTestStore() {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware, usersApi.middleware),
  });
}

const signup = {
  email: 'test@example.com',
  password: 'password',
  first_name: 'Test',
  last_name: 'Employee',
};

describe('authApi error handling', () => {
  beforeEach(() => {
    baseQueryMock.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes the employee list after a successful sign-up', async () => {
    const result = {
      token: 'token',
      userId: 'employee-1',
      mustChangePassword: false,
    };
    baseQueryMock.mockResolvedValue({ data: result });
    const invalidateTags = vi.spyOn(usersApi.util, 'invalidateTags');
    const store = createTestStore();

    await expect(
      store.dispatch(authApi.endpoints.signUp.initiate(signup)).unwrap(),
    ).resolves.toEqual(result);

    expect(invalidateTags).toHaveBeenCalledWith(['users']);
  });

  it('returns sign-up failures to the normal UI error path without refreshing users', async () => {
    const error = { status: 400, data: { error: 'Email already exists' } };
    baseQueryMock.mockResolvedValue({ error });
    const invalidateTags = vi.spyOn(usersApi.util, 'invalidateTags');
    const store = createTestStore();

    await expect(
      store.dispatch(authApi.endpoints.signUp.initiate(signup)).unwrap(),
    ).rejects.toEqual(error);

    expect(getErrorMessage(error)).toBe('Email already exists');
    expect(invalidateTags).not.toHaveBeenCalled();
  });

  it('uses the active session token for a password update', async () => {
    localStorage.setItem('authData', JSON.stringify({ token: 'old-token' }));
    sessionStorage.setItem('loggedInUser', 'test@example.com');
    sessionStorage.setItem(
      'authData',
      JSON.stringify({ token: 'session-token' }),
    );
    baseQueryMock.mockResolvedValue({ data: { message: 'Password updated' } });
    const store = createTestStore();

    await store
      .dispatch(
        authApi.endpoints.setNewPassword.initiate({
          email: 'test@example.com',
          newPassword: 'new-password',
        }),
      )
      .unwrap();

    expect(baseQueryMock.mock.calls[0][0].headers.Authorization).toBe(
      'session-token',
    );
  });

  it('returns a displayable storage error without making a password request', async () => {
    sessionStorage.setItem('loggedInUser', 'test@example.com');
    sessionStorage.setItem('authData', '{invalid json');
    const store = createTestStore();
    const mutation = store.dispatch(
      authApi.endpoints.setNewPassword.initiate({
        email: 'test@example.com',
        newPassword: 'new-password',
      }),
    );

    await expect(mutation.unwrap()).rejects.toMatchObject({
      status: 'CUSTOM_ERROR',
      data: {
        error:
          'Your saved sign-in data could not be loaded. Please sign in again.',
      },
    });
    expect(baseQueryMock).not.toHaveBeenCalled();
  });
});
