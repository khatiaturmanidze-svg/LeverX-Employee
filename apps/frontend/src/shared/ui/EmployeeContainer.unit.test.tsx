import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeContainer from './EmployeeContainer';
import { IEmployee } from '../../types/type';

const mockNavigate = vi.fn();

type MockEmployeeCardProps = {
  user: IEmployee;
  onClick: (id: string) => void;
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('./EmployeeCard', () => ({
  default: ({ user, onClick }: MockEmployeeCardProps) => (
    <div data-testid="employee-card" onClick={() => onClick(user._id)}>
      {user.first_name}
    </div>
  ),
}));

vi.mock('./ListHeader', () => ({
  default: () => <div data-testid="list-header" />,
}));

const mockUsers: IEmployee[] = [
  {
    _id: '1',
    first_name: 'John',
    last_name: 'Doe',
    department: 'Engineering',
    room: '101',
  } as IEmployee,
  {
    _id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    department: 'HR',
    room: '102',
  } as IEmployee,
];

describe('EmployeeContainer', () => {
  it('renders all employees', () => {
    render(<EmployeeContainer users={mockUsers} viewMode="grid" />);

    const cards = screen.getAllByTestId('employee-card');
    expect(cards).toHaveLength(2);
  });

  it('renders ListHeader only in list mode', () => {
    const { rerender } = render(
      <EmployeeContainer users={mockUsers} viewMode="grid" />,
    );

    expect(screen.queryByTestId('list-header')).not.toBeInTheDocument();

    rerender(<EmployeeContainer users={mockUsers} viewMode="list" />);

    expect(screen.getByTestId('list-header')).toBeInTheDocument();
  });

  it('uses correct container class based on viewMode', () => {
    const { container, rerender } = render(
      <EmployeeContainer users={mockUsers} viewMode="grid" />,
    );

    expect(container.firstChild).toHaveClass('employee-grid__container');

    rerender(<EmployeeContainer users={mockUsers} viewMode="list" />);

    expect(container.firstChild).toHaveClass('employee-menu__container');
  });

  it('navigates to details page when employee is clicked', () => {
    render(<EmployeeContainer users={mockUsers} viewMode="grid" />);

    const cards = screen.getAllByTestId('employee-card');

    cards[0].click();

    expect(mockNavigate).toHaveBeenCalledWith('/details/1');
  });
});
