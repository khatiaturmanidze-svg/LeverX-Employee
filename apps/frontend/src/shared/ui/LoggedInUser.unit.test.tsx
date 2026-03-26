import { render, screen, fireEvent } from '@testing-library/react';
import LoggedInUser from './LoggedInUser';
import { IEmployee } from '../../types/type';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Router from 'react-router-dom';

describe('LoggedInUser', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.spyOn(Router, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser: IEmployee = {
    _id: '1',
    first_name: 'John',
    last_name: 'Doe',
    user_avatar: '/avatar.png',
  } as IEmployee;

  it('renders user info when logged in', () => {
    render(<LoggedInUser loggedInUser={mockUser} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('employee')).toBeInTheDocument();
  });

  it('renders "Not Logged In" when user is null', () => {
    render(<LoggedInUser loggedInUser={null} />);
    expect(screen.getByText('Not Logged In')).toBeInTheDocument();
  });

  it('calls navigate on click when user is logged in', () => {
    render(<LoggedInUser loggedInUser={mockUser} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/details/1');
  });

  it('does not call navigate when no user', () => {
    render(<LoggedInUser loggedInUser={null} />);
    fireEvent.click(screen.getByText('Not Logged In'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
