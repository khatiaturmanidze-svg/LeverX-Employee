import { render, screen, fireEvent } from '@testing-library/react';
import LoggedInUser from './LoggedInUser';
import { IEmployee } from '../../types/type';
import { describe, it, expect, vi, afterEach } from 'vitest';

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));
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
describe('LoggedInUser', () => {
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
