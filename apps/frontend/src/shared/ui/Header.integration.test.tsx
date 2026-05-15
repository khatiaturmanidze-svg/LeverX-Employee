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
    expect(
      screen.getByRole('button', { name: 'open menu' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'close menu overlay' }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('header-tabs')).toHaveLength(2);
    expect(screen.getAllByTestId('header-tabs')[0]).toHaveTextContent(
      'Admin Tabs',
    );
    expect(screen.getAllByTestId('logged-user')).toHaveLength(2);
    expect(screen.getAllByTestId('logged-user')[0]).toHaveTextContent('John');
    expect(screen.getAllByText('Support')).toHaveLength(2);
    expect(screen.getAllByText('Log Off')).toHaveLength(2);
  });

  it('renders fallback for no logged in user', () => {
    render(<Header loggedInUser={null} />);

    expect(
      screen.getByRole('button', { name: 'open menu' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'close menu overlay' }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('logged-user')).toHaveLength(2);
    expect(screen.getAllByTestId('logged-user')[0]).toHaveTextContent('Guest');
    expect(screen.getAllByTestId('header-tabs')).toHaveLength(2);
    expect(screen.getAllByTestId('header-tabs')[0]).toHaveTextContent(
      'User Tabs',
    );
  });
});
