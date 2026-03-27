import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SignHeader from './SignHeader';
import { vi, describe, it, afterEach, expect } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom'; // Import this
import * as Router from 'react-router-dom';
import type { Location } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();

// Mock useNavigate globally for this file
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignHeader', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup(); // Ensure DOM is cleared
  });

  it('renders "Sign Up" button on non-signup page', () => {
    const mockLocation: Partial<Location> = {
      pathname: '/signin',
    };

    // Spy on useLocation to return our mock path
    vi.spyOn(Router, 'useLocation').mockReturnValue(mockLocation as Location);

    render(
      <MemoryRouter>
        <SignHeader />
      </MemoryRouter>,
    );

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    expect(signUpButton).toBeInTheDocument();

    // Check that Sign In button is NOT there
    expect(
      screen.queryByRole('button', { name: /sign in/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(signUpButton);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('renders "Sign In" button on signup page', () => {
    const mockLocation: Partial<Location> = {
      pathname: '/signup',
    };

    vi.spyOn(Router, 'useLocation').mockReturnValue(mockLocation as Location);

    render(
      <MemoryRouter>
        <SignHeader />
      </MemoryRouter>,
    );

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();

    // Check that Sign Up button is NOT there
    expect(
      screen.queryByRole('button', { name: /sign up/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(signInButton);
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });
});
