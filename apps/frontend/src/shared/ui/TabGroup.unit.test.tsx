import { render, screen, fireEvent } from '@testing-library/react';
import TabGroup from './TabGroup';
import { vi, expect, describe, it } from 'vitest';

describe('TabGroup', () => {
  const mockOnClick = vi.fn();
  const tabs = [
    { id: '1', label: 'Profile', isActive: true, onClick: mockOnClick },
    { id: '2', label: 'Settings', isActive: false, onClick: mockOnClick },
  ];

  it('renders all tabs and handles clicks', () => {
    render(
      <TabGroup
        tabs={tabs}
        tabBaseClassName="tab-btn"
        activeModifierClassName="active"
      />,
    );

    // Find the button by its text
    const profileTab = screen.getByText('Profile');
    expect(profileTab).toBeInTheDocument();

    // Check for the active class
    expect(profileTab).toHaveClass('active');

    // Simulate click
    fireEvent.click(screen.getByText('Settings'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
