import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IEmployee } from '../../types/type';
import AvatarSection from './AvatarSection';
import React from 'react';

const mockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  first_native_name: 'John',
  last_native_name: 'Doe',
  role: 'Engineer',
  user_avatar: '/avatar.png',
  isRemoteWork: true,
  department: 'Engineering',
  building: 'Building 1',
  room: 'Room 101',
  email: 'john.doe@example.com',
} as IEmployee;

describe('AvatarSection', () => {
  it('renders full name and native name', () => {
    render(
      <AvatarSection
        user={mockUser}
        canEdit={false}
        onEditClick={vi.fn()}
        onCopyLink={vi.fn()}
      />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders remote work icon when user.isRemoteWork is true', () => {
    render(
      <AvatarSection
        user={mockUser}
        canEdit={false}
        onEditClick={vi.fn()}
        onCopyLink={vi.fn()}
      />,
    );

    expect(screen.getByAltText('home icon')).toBeInTheDocument();
  });

  it('does NOT render remote work icon when user.isRemoteWork is false', () => {
    render(
      <AvatarSection
        user={{ ...mockUser, isRemoteWork: false }}
        canEdit={false}
        onEditClick={vi.fn()}
        onCopyLink={vi.fn()}
      />,
    );

    expect(screen.queryByAltText('home icon')).not.toBeInTheDocument();
  });

  it('renders edit button only when canEdit is true', () => {
    const { rerender } = render(
      <AvatarSection
        user={mockUser}
        canEdit={false}
        onEditClick={vi.fn()}
        onCopyLink={vi.fn()}
      />,
    );

    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();

    rerender(
      <AvatarSection
        user={mockUser}
        canEdit={true}
        onEditClick={vi.fn()}
        onCopyLink={vi.fn()}
      />,
    );

    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });

  it('calls onEditClick when edit button is clicked', () => {
    const onEditClick = vi.fn();

    render(
      <AvatarSection
        user={mockUser}
        canEdit={true}
        onEditClick={onEditClick}
        onCopyLink={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/edit/i));
    expect(onEditClick).toHaveBeenCalledTimes(1);
  });

  it('calls onCopyLink when copy button is clicked', () => {
    const onCopyLink = vi.fn();

    render(
      <AvatarSection
        user={mockUser}
        canEdit={false}
        onEditClick={vi.fn()}
        onCopyLink={onCopyLink}
      />,
    );

    fireEvent.click(screen.getByText(/copy link/i));
    expect(onCopyLink).toHaveBeenCalledTimes(1);
  });
});
