import { it, expect, describe, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import BtnLogOff from './BtnLogOff';
import * as router from 'react-router-dom';
import userEvent from '@testing-library/user-event';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('BtnLogOff', () => {
  it('should render button', () => {
    render(<BtnLogOff />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    const img = within(button).getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it('navigates to / when clicking the image', async () => {
    const navigateMock = vi.fn();
    vi.spyOn(router, 'useNavigate').mockReturnValue(navigateMock);

    render(<BtnLogOff />);

    const img = screen.getByAltText('log off icon');
    await userEvent.click(img);

    expect(navigateMock).toHaveBeenCalledWith('/');
  });
  it('removes user from localStorage if present and navigates', async () => {
    const navigateMock = vi.fn();
    vi.spyOn(router, 'useNavigate').mockReturnValue(navigateMock);

    localStorage.setItem('loggedInUser', 'testUser');
    render(<BtnLogOff />);

    await userEvent.click(screen.getByRole('button'));

    expect(localStorage.getItem('loggedInUser')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('removes user from sessionStorage if localStorage is empty', async () => {
    const navigateMock = vi.fn();
    vi.spyOn(router, 'useNavigate').mockReturnValue(navigateMock);

    sessionStorage.setItem('loggedInUser', 'sessionUser');

    render(<BtnLogOff />);

    await userEvent.click(screen.getByRole('button'));

    expect(sessionStorage.getItem('loggedInUser')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
