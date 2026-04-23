import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import Create from './Create';

const useGetHeaderPropsMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/lib', () => ({
  useGetHeaderProps: useGetHeaderPropsMock,
}));

vi.mock('@features/create-user', () => ({
  CreateUserForm: () =>
    React.createElement('section', null, 'Create user form'),
  CreateUserUpload: () =>
    React.createElement('section', null, 'Create user upload'),
}));

vi.mock('@/shared/ui/Header', () => ({
  Header: ({
    loggedInUser,
    isAdmin,
  }: {
    loggedInUser: { email: string };
    isAdmin: boolean;
  }) =>
    React.createElement(
      'header',
      { 'data-testid': 'create-header' },
      `${loggedInUser.email}:${String(isAdmin)}`,
    ),
}));

describe('Create page', () => {
  it('renders header with logged-in user props and both create-user widgets', () => {
    useGetHeaderPropsMock.mockReturnValue({
      loggedUser: { email: 'admin@example.com' },
      isAdmin: true,
    });

    render(<Create />);

    expect(screen.getByTestId('create-header')).toHaveTextContent(
      'admin@example.com:true',
    );
    expect(screen.getByText('Create user form')).toBeInTheDocument();
    expect(screen.getByText('Create user upload')).toBeInTheDocument();
  });
});
