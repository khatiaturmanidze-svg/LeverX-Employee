import { render, screen } from '@testing-library/react';
import React from 'react';
import SignMain from './SignMain';
import { describe, it, expect } from 'vitest';

describe('SignMain', () => {
  it('renders welcome message and children', () => {
    render(
      <SignMain>
        <div data-testid="child-form">Form goes here</div>
      </SignMain>,
    );
    expect(
      screen.getByRole('heading', { name: /welcome/i }),
    ).toBeInTheDocument();
  });
});
