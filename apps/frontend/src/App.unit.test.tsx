import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

vi.mock(
  '@/pages',
  async () => (await import('./App.unit.test.mocks')).mockPagesModule,
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
