import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmployeeView } from './EmployeeView';
import { IEmployee } from '../../types/type';

afterEach(() => {
  cleanup();
});

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

    const deptRow = screen.getByTestId('detail-Department');
    expect(deptRow).toHaveTextContent('Engineering');

    const dobRow = screen.getByTestId('detail-Date-Birth');
    expect(dobRow).toHaveTextContent('Jan'); // avoid locale pain

    const managerRow = screen.getByTestId('detail-Manager');
    expect(managerRow).toHaveTextContent('John Doe');
  });

  it('renders contacts correctly', () => {
    render(<EmployeeView user={mockUser} />);

    const phoneRow = screen.getByTestId('detail-Phone');
    expect(phoneRow).toHaveTextContent('123-456-7890');

    const emailRow = screen.getByTestId('detail-Email');
    expect(emailRow).toHaveTextContent('john.doe@example.com');
  });

  it('renders visa info if available', () => {
    render(<EmployeeView user={mockUser} />);

    const visasHeading = screen.getByRole('heading', { name: /visas/i });
    expect(visasHeading).toBeInTheDocument();

    const issuingCountryRow = screen.getByTestId('detail-Issuing-Country');
    expect(issuingCountryRow).toHaveTextContent('Canada');

    const typeRow = screen.getByTestId('detail-Type');
    expect(typeRow).toHaveTextContent('Work');

    const startDateRow = screen.getByTestId('detail-Start-Date');
    expect(startDateRow).toHaveTextContent('2023');

    const endDateRow = screen.getByTestId('detail-End-Date');
    expect(endDateRow).toHaveTextContent('2024');
  });

  it('renders fallback text for missing manager or date of birth', () => {
    const userWithoutManagerDOB = {
      ...mockUser,
      manager: undefined,
      date_birth: undefined,
    };

    render(<EmployeeView user={userWithoutManagerDOB} />);

    const managerRow = screen.getByTestId('detail-Manager');
    expect(managerRow).toHaveTextContent(/no manager assigned/i);

    const dobRow = screen.getByTestId('detail-Date-Birth');
    expect(dobRow).toHaveTextContent(/no date of birth/i);
  });
});
