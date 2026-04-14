import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import Wrapper from './Wrapper';
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { wrapperMockUser } from './test-mocks';

// Force a cleanup after each test to ensure
// "home icon" from one test doesn't bleed into the next.
afterEach(() => {
  cleanup();
});

describe('Wrapper', () => {
  it('renders the user avatar with correct alt and src', () => {
    render(<Wrapper display="grid" user={wrapperMockUser} />);

    const avatar = screen.getByAltText('John');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/avatar.png');
  });

  it('renders the home icon when user.isRemoteWork is true', () => {
    render(<Wrapper display="grid" user={wrapperMockUser} />);

    // By using getByAltText here, we confirm exactly ONE exists
    const homeIcon = screen.getByAltText('home icon');
    expect(homeIcon).toBeInTheDocument();
    expect(homeIcon).toHaveAttribute('src', '/svgs/home-icon.svg');
  });

  it('does NOT render the home icon when user.isRemoteWork is false', () => {
    const officeUser = { ...wrapperMockUser, isRemoteWork: false };

    render(<Wrapper display="grid" user={officeUser} />);

    // queryBy returns null if not found, whereas getBy would throw an error
    expect(screen.queryByAltText('home icon')).not.toBeInTheDocument();
  });

  it('applies the correct display class to the images', () => {
    render(<Wrapper display="list" user={wrapperMockUser} />);

    expect(screen.getByAltText('John')).toHaveClass('employee-list__img');
    expect(screen.getByAltText('home icon')).toHaveClass('home-box__list');
  });
});
