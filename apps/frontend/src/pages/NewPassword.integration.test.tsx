import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NewPassword from './NewPassword';
const mocks = vi.hoisted(() => ({ update: vi.fn(), navigate: vi.fn() }));
vi.mock('../features/authApi', () => ({
  useSetNewPasswordMutation: () => [mocks.update, { isLoading: false }],
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('@shared/ui', () => ({
  SignHeader: () => <header />,
  SignMain: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
  BtnSubmit: ({ children }: { children: React.ReactNode }) => (
    <button type="submit">{children}</button>
  ),
}));
describe('required password replacement', () => {
  beforeEach(() => {
    mocks.update.mockReset();
    mocks.navigate.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });
  it('submits only the new password, ignoring spoofed stored email and flags', async () => {
    localStorage.setItem('loggedInUser', 'victim@example.test');
    localStorage.setItem(
      'authData',
      JSON.stringify({ mustChangePassword: false }),
    );
    mocks.update.mockReturnValue({
      unwrap: async () => ({
        message: 'Password updated',
        csrfToken: 'new-csrf',
      }),
    });
    render(<NewPassword />);
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'my-new-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set new password' }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({
        newPassword: 'my-new-password',
      }),
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/main', { replace: true });
  });
  it('works without any browser-stored identity', async () => {
    mocks.update.mockReturnValue({
      unwrap: async () => ({
        message: 'Password updated',
        csrfToken: 'new-csrf',
      }),
    });
    render(<NewPassword />);
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'replacement' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set new password' }));
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith('/main', { replace: true }),
    );
    expect(localStorage.getItem('authData')).toBeNull();
    expect(sessionStorage.getItem('authData')).toBeNull();
  });
  it('shows server failures without navigating or changing client flags', async () => {
    mocks.update.mockReturnValue({
      unwrap: async () => {
        throw new Error('Account state changed');
      },
    });
    render(<NewPassword />);
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'replacement' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set new password' }));
    expect(
      await screen.findByText('Account state changed'),
    ).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
