import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EmployeeHeader from './EmployeeHeader';
import { employeeHeaderMockUsers } from './test-mocks';

vi.mock(
  '@shared/ui',
  async () => (await import('./test-mocks')).employeeHeaderSharedUiModule,
);

describe('EmployeeHeader', () => {
  it('renders correct employee count', () => {
    render(
      <EmployeeHeader users={employeeHeaderMockUsers} onViewChange={vi.fn()} />,
    );
    expect(screen.getByText('2 employees displayed')).toBeInTheDocument();
  });

  it('calls onViewChange when grid tab is clicked', () => {
    const onViewChange = vi.fn();
    render(
      <EmployeeHeader
        users={employeeHeaderMockUsers}
        onViewChange={onViewChange}
      />,
    );

    fireEvent.click(screen.getByTestId('tab-grid'));
    expect(onViewChange).toHaveBeenCalledWith('grid');
  });

  it('calls onViewChange when list tab is clicked', () => {
    const onViewChange = vi.fn();
    render(
      <EmployeeHeader
        users={employeeHeaderMockUsers}
        onViewChange={onViewChange}
      />,
    );

    fireEvent.click(screen.getByTestId('tab-list'));
    expect(onViewChange).toHaveBeenCalledWith('list');
  });

  it('calls onViewChange when table tab is clicked', () => {
    const onViewChange = vi.fn();
    render(
      <EmployeeHeader
        users={employeeHeaderMockUsers}
        onViewChange={onViewChange}
      />,
    );

    fireEvent.click(screen.getByTestId('tab-table'));
    expect(onViewChange).toHaveBeenCalledWith('table');
  });

  it('supports keyboard navigation between view toggle buttons', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    render(
      <EmployeeHeader
        users={employeeHeaderMockUsers}
        onViewChange={onViewChange}
      />,
    );

    await user.tab();
    expect(screen.getByTestId('tab-grid')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('tab-list')).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onViewChange).toHaveBeenCalledWith('list');
  });
});
