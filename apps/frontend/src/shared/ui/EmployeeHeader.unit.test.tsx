import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeHeader from './EmployeeHeader';
import { IEmployee } from '../../types/type';

type Tab = {
  id: string;
  onClick: () => void;
  isActive: boolean;
  className?: string;
  label?: React.ReactNode;
};

vi.mock('../../shared/ui/TabGroup', () => ({
  default: ({ tabs }: { tabs: Tab[] }) => (
    <div>
      {tabs.map((tab: any) => (
        <button
          key={tab.id}
          data-testid={`tab-${tab.id}`}
          onClick={tab.onClick}
        >
          {tab.id}
        </button>
      ))}
    </div>
  ),
}));

const mockUsers: IEmployee[] = [
  { _id: '1', first_name: 'John', last_name: 'Doe' } as IEmployee,
  { _id: '2', first_name: 'Jane', last_name: 'Smith' } as IEmployee,
];

describe('EmployeeHeader', () => {
  it('renders correct employee count', () => {
    render(<EmployeeHeader users={mockUsers} onViewChange={vi.fn()} />);
    expect(screen.getByText('2 employees displayed')).toBeInTheDocument();
  });

  it('calls onViewChange when grid tab is clicked', () => {
    const onViewChange = vi.fn();
    render(<EmployeeHeader users={mockUsers} onViewChange={onViewChange} />);

    fireEvent.click(screen.getByTestId('tab-grid'));
    expect(onViewChange).toHaveBeenCalledWith('grid');
  });

  it('calls onViewChange when list tab is clicked', () => {
    const onViewChange = vi.fn();
    render(<EmployeeHeader users={mockUsers} onViewChange={onViewChange} />);

    fireEvent.click(screen.getByTestId('tab-list'));
    expect(onViewChange).toHaveBeenCalledWith('list');
  });
});
