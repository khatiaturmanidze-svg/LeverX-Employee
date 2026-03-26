import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HeaderTabs from './HeaderTabs';
import type { IEmployee } from '../../types/type';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/main' }),
  };
});

const mockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  role: 'Admin',
  user_avatar: '/avatar.png',
  department: 'Engineering',
  building: 'HQ',
  room: '101',
  phone: '123456',
  email: 'john.doe@example.com',
} as IEmployee;

describe('HeaderTabs Integration', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders default tabs for normal user', () => {
    render(
      <MemoryRouter>
        <HeaderTabs loggedInUser={{ ...mockUser, role: 'User' }} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Address Book')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.getByText('Requests')).toBeInTheDocument();
  });

  it('renders settings tab for admin', () => {
    render(
      <MemoryRouter>
        <HeaderTabs loggedInUser={mockUser} isAdmin />
      </MemoryRouter>,
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls navigate on tab click', () => {
    render(
      <MemoryRouter>
        <HeaderTabs loggedInUser={mockUser} isAdmin />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Requests'));
    expect(mockNavigate).toHaveBeenCalledWith(`/requests/${mockUser._id}`);
  });
});
