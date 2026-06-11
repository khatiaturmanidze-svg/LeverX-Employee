import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HeaderMenu } from './HeaderMenu';
import type { IEmployee } from '../../types/type';

vi.mock('./HeaderTabs', () => ({
  default: ({
    isAdmin,
    loggedInUser,
    containerClassName,
  }: {
    isAdmin?: boolean;
    loggedInUser: IEmployee | null;
    containerClassName?: string;
  }) => (
    <div
      data-testid="header-tabs"
      data-admin={String(Boolean(isAdmin))}
      data-user-id={loggedInUser?._id ?? 'none'}
      data-container-class={containerClassName ?? ''}
    >
      Header Tabs
    </div>
  ),
}));

const mockUser: IEmployee = {
  _id: 'user-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  department: 'Engineering',
  building: 'HQ',
  room: '101',
  role: 'Admin',
} as IEmployee;

describe('HeaderMenu', () => {
  it('renders closed by default', () => {
    render(
      <MemoryRouter>
        <HeaderMenu loggedInUser={mockUser} isAdmin />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.getByRole('button', { name: 'close menu overlay' }),
    ).not.toHaveClass('header--mobile-overlay-open');
    expect(screen.getByTestId('header-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('header-tabs').parentElement).not.toHaveClass(
      'header--mobile-menu-open',
    );
  });

  it('opens the sidebar and passes mobile tab props when icon is clicked', () => {
    render(
      <MemoryRouter>
        <HeaderMenu loggedInUser={mockUser} isAdmin />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'open menu' }));

    expect(screen.getByRole('button', { name: 'close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'close menu overlay' }),
    ).toHaveClass('header--mobile-overlay-open');
    expect(screen.getByTestId('header-tabs').parentElement).toHaveClass(
      'header--mobile-menu-open',
    );
    expect(screen.getByTestId('header-tabs')).toHaveAttribute(
      'data-admin',
      'true',
    );
    expect(screen.getByTestId('header-tabs')).toHaveAttribute(
      'data-user-id',
      mockUser._id,
    );
    expect(screen.getByTestId('header-tabs')).toHaveAttribute(
      'data-container-class',
      'tab-container header__mobile-tabs',
    );
  });

  it('closes the sidebar when overlay is clicked', () => {
    render(
      <MemoryRouter>
        <HeaderMenu loggedInUser={mockUser} isAdmin />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'open menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'close menu overlay' }));

    expect(screen.getByRole('button', { name: 'open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.getByRole('button', { name: 'close menu overlay' }),
    ).not.toHaveClass('header--mobile-overlay-open');
    expect(screen.getByTestId('header-tabs').parentElement).not.toHaveClass(
      'header--mobile-menu-open',
    );
  });

  it('opens the sidebar from the keyboard', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HeaderMenu loggedInUser={mockUser} isAdmin />
      </MemoryRouter>,
    );

    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'open menu' })).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: 'close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByTestId('header-tabs').parentElement).toHaveClass(
      'header--mobile-menu-open',
    );
  });
});
