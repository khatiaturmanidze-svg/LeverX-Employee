import { render, screen } from '@testing-library/react';
import React from 'react';
import Wrapper from './Wrapper';
import { IEmployee } from '../../types/type';
import { describe, it, expect } from 'vitest';

const mockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  role: 'Engineer',
  user_avatar: '/avatar.png',
  isRemoteWork: true,
  department: 'Engineering',
  building: 'Building 1',
  room: 'Room 101',
  email: 'john.doe@example.com',
} as IEmployee;

describe('Wrapper', () => {
  it('renders the user avatar', () => {
    render(<Wrapper display="grid" user={mockUser} />);
    expect(screen.getByAltText('John')).toBeInTheDocument();
  });

  it('renders the home icon when user.isRemoteWork is true', () => {
    render(<Wrapper display="grid" user={mockUser} />);
    expect(screen.getByAltText('home icon')).toBeInTheDocument();
  });

  it('does NOT render the home icon when user.isRemoteWork is false', () => {
    render(
      <Wrapper display="grid" user={{ ...mockUser, isRemoteWork: false }} />,
    );
    expect(screen.queryByAltText('home icon')).not.toBeInTheDocument();
  });
});
