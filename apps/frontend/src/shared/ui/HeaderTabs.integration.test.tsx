import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HeaderTabs from './HeaderTabs';
import { headerTabsMockUser, sharedUiNavigateMock } from './test-mocks';

vi.mock('react-router-dom', async () => {
  const { headerTabsRouterModule } = await import('./test-mocks');
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    ...headerTabsRouterModule,
  };
});

describe('HeaderTabs Integration', () => {
  beforeEach(() => {
    sharedUiNavigateMock.mockClear();
  });

  it('renders default tabs for normal user', () => {
    render(
      <MemoryRouter>
        <HeaderTabs loggedInUser={{ ...headerTabsMockUser, role: 'User' }} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Address Book')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.getByText('Requests')).toBeInTheDocument();
  });

  it('renders settings tab for admin', () => {
    render(
      <MemoryRouter>
        <HeaderTabs loggedInUser={headerTabsMockUser} isAdmin />
      </MemoryRouter>,
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls navigate on tab click', () => {
    render(
      <MemoryRouter>
        <HeaderTabs loggedInUser={headerTabsMockUser} isAdmin />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Requests'));
    expect(sharedUiNavigateMock).toHaveBeenCalledWith(
      `/requests/${headerTabsMockUser._id}`,
    );
  });
});
