import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import EmployeeTable from './EmployeeTable';
import type { IEmployee } from '@/types/type';

const updateEmployeeMock = vi.hoisted(() =>
  vi.fn(() => ({ unwrap: () => Promise.resolve() })),
);
const useCanEditMock = vi.hoisted(() => vi.fn());

vi.mock('react-window', () => ({
  List: ({
    rowComponent: RowComponent,
    rowCount,
    rowProps,
  }: {
    rowComponent: React.ComponentType<Record<string, unknown>>;
    rowCount: number;
    rowProps: Record<string, unknown>;
  }) => (
    <div data-testid="virtual-list">
      {Array.from({ length: rowCount }, (_, index) => (
        <RowComponent key={index} index={index} style={{}} {...rowProps} />
      ))}
    </div>
  ),
}));

vi.mock('@/features/usersApi', () => ({
  useUpdateEmployeeMutation: () => [updateEmployeeMock, { isLoading: false }],
}));

vi.mock('@/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared')>();
  return {
    ...actual,
    useCanEdit: useCanEditMock,
  };
});

const users: IEmployee[] = [
  {
    _id: '1',
    role: 'Employee',
    user_avatar: '/users/default.jpg',
    first_name: 'Jane',
    last_name: 'Doe',
    department: 'Frontend',
    building: 'HQ',
    room: '401',
    desk_number: 14,
    isRemoteWork: false,
    email: 'jane.doe@example.com',
    manager: { id: '9', first_name: 'Ada', last_name: 'Manager' },
  } as IEmployee,
];

describe('EmployeeTable', () => {
  beforeEach(() => {
    updateEmployeeMock.mockClear();
    useCanEditMock.mockReturnValue(true);
  });

  it('renders headers and virtualized rows', () => {
    render(<EmployeeTable users={users} onViewDetails={vi.fn()} />);

    expect(
      screen.getByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Desk' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('navigates to details from the row action', () => {
    const onViewDetails = vi.fn();

    render(<EmployeeTable users={users} onViewDetails={onViewDetails} />);

    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(onViewDetails).toHaveBeenCalledWith('1');
  });

  it('supports keyboard navigation to the row action', async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();

    render(<EmployeeTable users={users} onViewDetails={onViewDetails} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Details' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onViewDetails).toHaveBeenCalledWith('1');
  });

  it('saves edited row values through update mutation', async () => {
    render(<EmployeeTable users={users} onViewDetails={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByDisplayValue('Frontend'), {
      target: { value: 'Backend' },
    });
    fireEvent.change(screen.getByDisplayValue('14'), {
      target: { value: '22' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateEmployeeMock).toHaveBeenCalledWith({
        id: '1',
        update: expect.objectContaining({
          department: 'Backend',
          desk_number: 22,
          email: 'jane.doe@example.com',
        }),
      });
    });
  });
});
