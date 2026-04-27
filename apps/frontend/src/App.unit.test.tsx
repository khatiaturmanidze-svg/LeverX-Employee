import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('redirects "/" to "/signin"', async () => {
    render(<App />);

    expect(await screen.findByTestId('signin-page')).toBeInTheDocument();

    await waitFor(() => {
      expect(window.location.pathname).toBe('/signin');
    });
  });

  it('renders sign up page on "/signup"', async () => {
    window.history.pushState({}, '', '/signup');

    render(<App />);

    expect(await screen.findByTestId('signup-page')).toBeInTheDocument();
  });

  it('redirects unauthenticated user from "/main" to "/signin"', async () => {
    window.history.pushState({}, '', '/main');

    render(<App />);

    expect(await screen.findByTestId('signin-page')).toBeInTheDocument();

    await waitFor(() => {
      expect(window.location.pathname).toBe('/signin');
    });
  });

  it('renders "/main" for authenticated user from localStorage', async () => {
    localStorage.setItem('loggedInUser', 'user@example.com');
    window.history.pushState({}, '', '/main');

    render(<App />);

    expect(await screen.findByTestId('main-page')).toBeInTheDocument();
  });

  it('renders "/details/:id" for authenticated user from sessionStorage', async () => {
    sessionStorage.setItem('loggedInUser', 'user@example.com');
    window.history.pushState({}, '', '/details/123');

    render(<App />);

    expect(await screen.findByTestId('details-page')).toBeInTheDocument();
  });

  it('renders "/roles" for authenticated user', async () => {
    localStorage.setItem('loggedInUser', 'user@example.com');
    window.history.pushState({}, '', '/roles');

    render(<App />);

    expect(await screen.findByTestId('roles-page')).toBeInTheDocument();
  });

  it('renders "/requests/:id" for authenticated user', async () => {
    localStorage.setItem('loggedInUser', 'user@example.com');
    window.history.pushState({}, '', '/requests/42');

    render(<App />);

    expect(await screen.findByTestId('requests-page')).toBeInTheDocument();
  });
});
