import { render, screen, fireEvent } from '@testing-library/react';
import LoggedInUser from './LoggedInUser';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { loggedInUserMockUser, sharedUiNavigateMock } from './test-mocks';

vi.mock('react-router-dom', async () => {
  const { loggedInUserRouterModule } = await import('./test-mocks');
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    ...loggedInUserRouterModule,
  };
});
describe('LoggedInUser', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders user info when logged in', () => {
    render(<LoggedInUser loggedInUser={loggedInUserMockUser} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('employee')).toBeInTheDocument();
  });

  it('renders "Not Logged In" when user is null', () => {
    render(<LoggedInUser loggedInUser={null} />);
    expect(screen.getByText('Not Logged In')).toBeInTheDocument();
  });

  it('calls navigate on click when user is logged in', () => {
    render(<LoggedInUser loggedInUser={loggedInUserMockUser} />);
    fireEvent.click(screen.getByRole('button'));
    expect(sharedUiNavigateMock).toHaveBeenCalledWith('/details/1');
  });

  it('does not call navigate when no user', () => {
    render(<LoggedInUser loggedInUser={null} />);
    fireEvent.click(screen.getByText('Not Logged In'));
    expect(sharedUiNavigateMock).not.toHaveBeenCalled();
  });
});
