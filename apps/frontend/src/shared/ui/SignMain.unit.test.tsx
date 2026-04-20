import { render, screen } from '@testing-library/react';
import React from 'react';
import SignMain from './SignMain';
import { describe, it, expect } from 'vitest';

describe('SignMain', () => {
  it('renders the updated sign-in message and children', () => {
    render(
      <SignMain>
        <div data-testid="child-form">Form goes here</div>
      </SignMain>,
    );

    expect(
      screen.getByRole('heading', {
        name: /everything your team needs, in one calm place\./i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/employee workspace/i)).toBeInTheDocument();
    expect(
      screen.getByText(/manage people, requests, and day-to-day employee/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('child-form')).toBeInTheDocument();
  });
});
