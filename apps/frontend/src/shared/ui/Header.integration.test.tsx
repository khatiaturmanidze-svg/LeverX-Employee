import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';
import { headerMockUser } from './test-mocks';

vi.mock('./Logo', async () => (await import('./test-mocks')).headerLogoModule);
vi.mock(
  './BtnLogOff',
  async () => (await import('./test-mocks')).headerBtnLogOffModule,
);
vi.mock(
  './BtnSupport',
  async () => (await import('./test-mocks')).headerBtnSupportModule,
);
vi.mock(
  './LoggedInUser',
  async () => (await import('./test-mocks')).headerLoggedInUserModule,
);
vi.mock(
  './HeaderTabs',
  async () => (await import('./test-mocks')).headerTabsModule,
);

describe('Header Integration', () => {
  it('renders all child components with user', () => {
    render(<Header loggedInUser={headerMockUser} isAdmin />);

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('header-tabs')).toHaveTextContent('Admin Tabs');
    expect(screen.getByTestId('logged-user')).toHaveTextContent('John');
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Log Off')).toBeInTheDocument();
  });

  it('renders fallback for no logged in user', () => {
    render(<Header loggedInUser={null} />);

    expect(screen.getByTestId('logged-user')).toHaveTextContent('Guest');
    expect(screen.getByTestId('header-tabs')).toHaveTextContent('User Tabs');
  });
});
