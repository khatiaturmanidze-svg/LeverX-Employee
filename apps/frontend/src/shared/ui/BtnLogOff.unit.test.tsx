import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BtnLogOff from './BtnLogOff';
const mocks = vi.hoisted(() => ({ logout: vi.fn(), navigate: vi.fn() }));
vi.mock('../../features/authApi', () => ({
  useSignOutMutation: () => [mocks.logout, { isLoading: false }],
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
describe('server logout', () => {
  beforeEach(() => {
    mocks.logout.mockReset();
    mocks.navigate.mockReset();
  });
  it('waits for server logout before navigating', async () => {
    mocks.logout.mockReturnValue({ unwrap: async () => undefined });
    render(<BtnLogOff />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(mocks.logout).toHaveBeenCalled());
    expect(mocks.navigate).toHaveBeenCalledWith('/signin', { replace: true });
  });
  it('keeps the user on the page and displays a failed logout', async () => {
    mocks.logout.mockReturnValue({
      unwrap: async () => {
        throw new Error('Service unavailable');
      },
    });
    render(<BtnLogOff />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Service unavailable',
    );
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
