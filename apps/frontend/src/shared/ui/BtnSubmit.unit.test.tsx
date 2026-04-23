import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BtnSubmit from './BtnSubmit';

describe('BtnSubmit', () => {
  it('renders children inside a submit button with custom class', () => {
    render(<BtnSubmit className="primary-action">Save</BtnSubmit>);

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('primary-action');
  });

  it('trims empty class names and calls handleSubmit when clicked', async () => {
    const handleSubmit = vi.fn();

    render(
      <BtnSubmit className="  " handleSubmit={handleSubmit}>
        Submit
      </BtnSubmit>,
    );

    const button = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(button);

    expect(button).toHaveAttribute('class', '');
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
