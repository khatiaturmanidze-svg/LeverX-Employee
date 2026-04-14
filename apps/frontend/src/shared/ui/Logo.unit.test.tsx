import { render, screen } from '@testing-library/react';
import Logo from './Logo';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('Logo', () => {
  it('renders the brand text and link', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>,
    );

    expect(screen.getByText('leverx')).toBeInTheDocument();
    expect(screen.getByText('employee services')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/main');
  });
});
