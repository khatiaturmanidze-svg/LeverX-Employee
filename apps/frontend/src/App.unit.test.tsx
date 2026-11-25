import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

vi.mock(
  '@/pages/SignIn',
  async () => (await import('./App.unit.test.mocks')).signInPageModule,
);
vi.mock(
  '@/pages/SignUp',
  async () => (await import('./App.unit.test.mocks')).signUpPageModule,
);
vi.mock(
  '@/pages/NewPassword',
  async () => (await import('./App.unit.test.mocks')).newPasswordPageModule,
);
vi.mock(
  '@/pages/Main',
  async () => (await import('./App.unit.test.mocks')).mainPageModule,
);
vi.mock(
  '@/pages/Details',
  async () => (await import('./App.unit.test.mocks')).detailsPageModule,
);
vi.mock(
  '@/pages/Roles',
  async () => (await import('./App.unit.test.mocks')).rolesPageModule,
);
vi.mock(
  '@/pages/Requests',
  async () => (await import('./App.unit.test.mocks')).requestsPageModule,
);
vi.mock(
  '@/pages/Create',
  async () => (await import('./App.unit.test.mocks')).createPageModule,
);

import { Provider } from 'react-redux';
import { createAppStore } from './app/store';
import { mockSessionServer } from './test/sessionServer';

describe('server-backed application session', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/');
  });
  afterEach(() => vi.unstubAllGlobals());
  function mount(path: string) {
    window.history.pushState({}, '', path);
    const store = createAppStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    return store;
  }
  it('checks /me then /csrf before rendering the login page', async () => {
    const server = mockSessionServer();
    mount('/main');
    expect(screen.queryByTestId('signin-page')).not.toBeInTheDocument();
    expect(await screen.findByTestId('signin-page')).toBeInTheDocument();
    expect(server.calls.map((call) => new URL(call.url).pathname)).toEqual([
      '/api/me',
      '/api/csrf',
    ]);
  });
  it('ignores forged browser storage and removes legacy credentials', async () => {
    mockSessionServer();
    localStorage.setItem('loggedInUser', 'admin@example.test');
    localStorage.setItem(
      'authData',
      JSON.stringify({ role: 'Admin', mustChangePassword: false }),
    );
    mount('/main');
    expect(await screen.findByTestId('signin-page')).toBeInTheDocument();
    expect(localStorage.getItem('authData')).toBeNull();
  });
  it.each(['/main', '/details/42', '/requests/42'])(
    'restores a valid session on %s without web-storage credentials',
    async (path) => {
      mockSessionServer({
        userId: '42',
        role: 'Employee',
        mustChangePassword: false,
      });
      mount(path);
      const page = path.startsWith('/details')
        ? 'details'
        : path.startsWith('/requests')
          ? 'requests'
          : 'main';
      expect(await screen.findByTestId(page + '-page')).toBeInTheDocument();
    },
  );
  it('enforces the server password-change flag', async () => {
    mockSessionServer({
      userId: '42',
      role: 'Employee',
      mustChangePassword: true,
    });
    mount('/main');
    expect(await screen.findByTestId('new-password-page')).toBeInTheDocument();
    expect(screen.queryByTestId('main-page')).not.toBeInTheDocument();
  });
  it.each([
    ['Employee', '/roles'],
    ['Employee', '/create'],
    ['HR', '/roles'],
    ['HR', '/create'],
  ])('shows access denied for %s visiting %s', async (role, path) => {
    mockSessionServer({
      userId: '42',
      role,
      mustChangePassword: false,
    });
    mount(path);
    expect(
      await screen.findByRole('heading', { name: 'Not authorized' }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe(path);
    expect(screen.queryByTestId('roles-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('create-page')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Back to employees' }));
    expect(await screen.findByTestId('main-page')).toBeInTheDocument();
  });
  it.each([
    ['/roles', 'roles-page'],
    ['/create', 'create-page'],
  ])('allows an administrator to open %s', async (path, page) => {
    mockSessionServer({
      userId: '42',
      role: 'Admin',
      mustChangePassword: false,
    });
    mount(path);
    expect(await screen.findByTestId(page)).toBeInTheDocument();
  });
  it('requires password replacement before checking administrator access', async () => {
    mockSessionServer({
      userId: '42',
      role: 'Employee',
      mustChangePassword: true,
    });
    mount('/roles');
    expect(await screen.findByTestId('new-password-page')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Not authorized' }),
    ).not.toBeInTheDocument();
  });
  it('shows a retryable error instead of claiming logout on server failure', async () => {
    const server = mockSessionServer();
    server.fetch.mockImplementationOnce(
      async () =>
        new Response('{}', {
          status: 503,
          headers: { 'content-type': 'application/json' },
        }),
    );
    mount('/main');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'could not check your session',
    );
    expect(screen.queryByTestId('signin-page')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByTestId('signin-page')).toBeInTheDocument();
  });
  it('offers signup only when enabled by the server', async () => {
    const server = mockSessionServer();
    server.fetch.mockImplementation(
      async (request) =>
        new Response(
          JSON.stringify(
            request.url.endsWith('/csrf')
              ? { csrfToken: 'csrf', allowPublicSignup: false }
              : { error: 'Sign in required' },
          ),
          {
            status: request.url.endsWith('/csrf') ? 200 : 401,
            headers: { 'content-type': 'application/json' },
          },
        ),
    );
    mount('/signup');
    await waitFor(() =>
      expect(screen.getByText(/Public signup is disabled/)).toBeInTheDocument(),
    );
    expect(screen.queryByTestId('signup-page')).not.toBeInTheDocument();
  });
});
