import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmployeeView } from './EmployeeView';
import { IEmployee } from '../../types/type';

// Mock DetailRow so we don't care about its internals
vi.mock('../../features/edit/ui/DetailRow', () => ({
  DetailRow: ({ label, value }: { label: string; value: string }) => (
    <div data-testid={`detail-${label.replace(/\s+/g, '-')}`}>
      <span>{label}</span>: <span>{value}</span>
    </div>
  ),
}));

const mockUser: IEmployee = {
  _id: '1',
  role: 'Employee',
  user_avatar: '/svgs/avatar',
  first_name: 'John',
  last_name: 'Doe',
  department: 'Engineering',
  building: 'Building 1',
  room: '101',
  desk_number: 12,
  phone: '123-456-7890',
  email: 'john.doe@example.com',
  citizenship: 'USA',
  isRemoteWork: true,
  date_birth: { year: 1999, month: 1, day: 1 },
  manager: {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
  },
  visa: [
    {
      issuing_country: 'Canada',
      type: 'Work',
      start_date: '2023-01-01',
      end_date: '2024-01-01',
    },
  ],
} as IEmployee;

describe('EmployeeView', () => {
  it('renders general info correctly', () => {
    render(<EmployeeView user={mockUser} />);

    expect(screen.getByText('Department:')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();

    expect(screen.getByText('Date Birth:')).toBeInTheDocument();
    expect(screen.getByText('01/01/1990')).toBeInTheDocument();

    expect(screen.getByText('Manager:')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders contacts correctly', () => {
    render(<EmployeeView user={mockUser} />);

    expect(screen.getByText('Phone:')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();

    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('renders visa info if available', () => {
    render(<EmployeeView user={mockUser} />);

    expect(screen.getByText('Visas')).toBeInTheDocument();
    expect(screen.getByText('Issuing Country:')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Type:')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Start Date:')).toBeInTheDocument();
    expect(screen.getByText('1/1/2023')).toBeInTheDocument(); // locale-specific
    expect(screen.getByText('End Date:')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
  });

  it('renders fallback text for missing manager or date of birth', () => {
    const userWithoutManagerDOB = {
      ...mockUser,
      manager: undefined,
      date_birth: undefined,
    };
    render(<EmployeeView user={userWithoutManagerDOB} />);

    expect(screen.getByText('Manager:')).toBeInTheDocument();
    expect(screen.getByText('no manager assigned')).toBeInTheDocument();

    expect(screen.getByText('Date Birth:')).toBeInTheDocument();
    expect(screen.getByText('no date of birth')).toBeInTheDocument();
  });
});
