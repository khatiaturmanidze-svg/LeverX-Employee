import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AvatarSection from './AvatarSection';
import React from 'react';
import { avatarSectionMockUser } from './test-mocks';

describe('AvatarSection', () => {
  it('renders full name and native name', () => {
    render(
      <AvatarSection
        user={avatarSectionMockUser}
        canEdit={false}
        onEditClick={vi.fn()}
        onCopyLink={vi.fn()}
      />,
    );

    const fullName = screen.getByRole('heading', { name: /john doe/i });
    expect(fullName).toBeInTheDocument();

    const nativeName = screen.getByText((content, element) =>
      Boolean(
        element &&
        element.classList.contains('avatar-section__native') &&
        content.includes('John') &&
        content.includes('Doe'),
      ),
    );
    expect(nativeName).toBeInTheDocument();
  });

  it('does NOT render remote work icon when user.isRemoteWork is false', () => {
    render(
      <AvatarSection
        user={{ ...avatarSectionMockUser, isRemoteWork: false }}
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
        user={avatarSectionMockUser}
        canEdit={false}
        onEditClick={vi.fn()}
        onCopyLink={vi.fn()}
      />,
    );

    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();

    rerender(
      <AvatarSection
        user={avatarSectionMockUser}
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
        user={avatarSectionMockUser}
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
        user={avatarSectionMockUser}
        canEdit={false}
        onEditClick={vi.fn()}
        onCopyLink={onCopyLink}
      />,
    );

    fireEvent.click(screen.getByText(/copy link/i));
    expect(onCopyLink).toHaveBeenCalledTimes(1);
  });
});
