import { render, screen, within } from '@testing-library/react';
import BtnSupport from './BtnSupport';
import { it, expect } from 'vitest';

it('renders support button with image and text', () => {
  render(<BtnSupport />);

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();

  const img = within(button).getByRole('img');
  expect(img).toHaveAttribute('alt', 'support icon');

  const text = within(button).getByText(/support/i);
  expect(text).toBeInTheDocument();
});
