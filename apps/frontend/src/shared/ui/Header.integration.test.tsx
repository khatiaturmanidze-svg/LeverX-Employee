import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';
import { IEmployee } from '../../types/type';

vi.mock('./Logo', () => ({ default: () => <div data-testid="logo" /> }));
vi.mock('./BtnLogOff', () => ({ default: () => <button>Log Off</button> }));
vi.mock('./BtnSupport', () => ({ default: () => <button>Support</button> }));
vi.mock('./HeaderMenu', () => ({
  HeaderMenu: () => <div data-testid="header-menu" />,
}));
vi.mock('./LoggedInUser', () => ({
  default: ({ loggedInUser }: { loggedInUser: IEmployee | null }) => (
    <div data-testid="logged-user">{loggedInUser?.first_name || 'Guest'}</div>
  ),
}));
vi.mock('./HeaderTabs', () => ({
  default: ({ isAdmin }: { isAdmin?: boolean }) => (
    <div data-testid="header-tabs">{isAdmin ? 'Admin Tabs' : 'User Tabs'}</div>
  ),
}));

const mockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  department: 'Engineering',
  building: 'Building 1',
  room: '101',
  email: 'john.doe@example.com',
} as IEmployee;

describe('Header Integration', () => {
  it('renders all child components with user', () => {
    render(<Header loggedInUser={mockUser} isAdmin />);

    expect(screen.getByTestId('header-menu')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('header-tabs')).toHaveTextContent('Admin Tabs');
    expect(screen.getByTestId('logged-user')).toHaveTextContent('John');
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Log Off')).toBeInTheDocument();
  });

  it('renders fallback for no logged in user', () => {
    render(<Header loggedInUser={null} />);

    expect(screen.getByTestId('header-menu')).toBeInTheDocument();
    expect(screen.getByTestId('logged-user')).toHaveTextContent('Guest');
    expect(screen.getByTestId('header-tabs')).toHaveTextContent('User Tabs');
  });
});
