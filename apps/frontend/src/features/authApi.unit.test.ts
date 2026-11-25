import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { createAppStore } from '../app/store';
import { authApi } from './authApi';
import { usersApi } from './usersApi';
import { sessionActions } from '../app/sessionSlice';
import { mockSessionServer } from '../test/sessionServer';

afterEach(() => vi.unstubAllGlobals());
describe('cookie session API', () => {
  it('bootstraps CSRF, signs in with cookies, rotates the token, and verifies /me', async () => {
    const server = mockSessionServer();
    const store = createAppStore();
    await store
      .dispatch(
        authApi.endpoints.signIn.initiate({
          email: 'user@example.test',
          password: 'password',
          rememberMe: true,
        }),
      )
      .unwrap();
    expect(server.calls.map((call) => new URL(call.url).pathname)).toEqual([
      '/api/csrf',
      '/api/sign-in',
      '/api/me',
    ]);
    expect(server.calls[1].credentials).toBe('include');
    expect(server.calls[1].headers.get('x-csrf-token')).toBe('initial-csrf');
    expect(server.calls[1].headers.has('authorization')).toBe(false);
    expect(store.getState().session.account?.userId).toBe('signed-in-id');
    expect(store.getState().session.csrfToken).toBe('rotated-csrf');
    expect(localStorage.getItem('authData')).toBeNull();
  });
  it('submits only the new password and replaces the in-memory session metadata', async () => {
    const server = mockSessionServer({
      userId: 'temporary',
      role: 'Employee',
      mustChangePassword: true,
    });
    const store = createAppStore();
    await store
      .dispatch(
        authApi.endpoints.setNewPassword.initiate({
          newPassword: 'new-password',
        }),
      )
      .unwrap();
    const mutation = server.calls.find((call) =>
      call.url.endsWith('/set-new-password'),
    )!;
    expect(await mutation.clone().json()).toEqual({
      newPassword: 'new-password',
    });
    expect(mutation.headers.get('x-csrf-token')).toBe('initial-csrf');
    expect(store.getState().session.account?.mustChangePassword).toBe(false);
    expect(store.getState().session.csrfToken).toBe('password-csrf');
  });
  it('clears identity and every account cache after successful server logout', async () => {
    mockSessionServer({
      userId: 'old-user',
      role: 'Admin',
      mustChangePassword: false,
    });
    const store = createAppStore();
    store.dispatch(
      sessionActions.accountReceived({
        userId: 'old-user',
        role: 'Admin',
        mustChangePassword: false,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 5));
    await store.dispatch(usersApi.endpoints.getUsers.initiate()).unwrap();
    expect(Object.keys(store.getState().usersApi.queries)).not.toHaveLength(0);
    await store.dispatch(authApi.endpoints.signOut.initiate()).unwrap();
    await waitFor(() =>
      expect(Object.keys(store.getState().usersApi.queries)).toHaveLength(0),
    );
    expect(store.getState().session.account).toBeNull();
    expect(Object.keys(store.getState().requestsApi.queries)).toHaveLength(0);
    expect(Object.keys(store.getState().createUserApi.queries)).toHaveLength(0);
  });
  it('keeps identity when logout fails and never reports a network failure as confirmed logout', async () => {
    const server = mockSessionServer();
    const store = createAppStore();
    store.dispatch(
      sessionActions.accountReceived({
        userId: 'current',
        role: 'Employee',
        mustChangePassword: false,
      }),
    );
    store.dispatch(sessionActions.csrfReceived({ csrfToken: 'csrf' }));
    server.fetch.mockImplementation(
      async () =>
        new Response(JSON.stringify({ error: 'Service unavailable' }), {
          status: 503,
          headers: { 'content-type': 'application/json' },
        }),
    );
    await expect(
      store.dispatch(authApi.endpoints.signOut.initiate()).unwrap(),
    ).rejects.toMatchObject({ status: 503 });
    expect(store.getState().session.account?.userId).toBe('current');
  });
});
