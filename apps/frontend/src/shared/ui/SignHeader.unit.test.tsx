import { render, screen, fireEvent } from '@testing-library/react';
import SignHeader from './SignHeader';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import React from 'react';
import * as Router from 'react-router-dom';
import type { Location } from 'react-router-dom';

describe('SignHeader', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.spyOn(Router, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Sign Up" button on non-signup page', () => {
    const mockLocation: Location = {
      pathname: '/signin',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    };
    vi.spyOn(Router, 'useLocation').mockReturnValue(mockLocation);

    render(<SignHeader />);

    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Sign Up'));
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('renders "Sign In" button on signup page', () => {
    const mockLocation: Location = {
      pathname: '/signup',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    };
    vi.spyOn(Router, 'useLocation').mockReturnValue(mockLocation);

    render(<SignHeader />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Sign In'));
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });
});
