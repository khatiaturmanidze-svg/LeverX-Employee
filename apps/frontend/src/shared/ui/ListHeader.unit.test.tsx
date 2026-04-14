import { render, screen } from '@testing-library/react';
import ListHeader from './ListHeader';
import { describe, it, expect } from 'vitest';

describe('ListHeader', () => {
  it('renders all header items with correct icons and labels', () => {
    render(<ListHeader />);

    expect(screen.getByAltText('photo icon')).toBeInTheDocument();
    expect(screen.getByText('Photo')).toBeInTheDocument();

    expect(screen.getByAltText('user icon')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();

    expect(screen.getByAltText('department icon')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();

    expect(screen.getByAltText('room icon')).toBeInTheDocument();
    expect(screen.getByText('Room')).toBeInTheDocument();
  });
});
