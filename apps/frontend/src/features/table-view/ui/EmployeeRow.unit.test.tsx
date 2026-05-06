import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import EmployeeRow from './EmployeeRow';
import type { EmployeeRowData } from '../model/types';
import type { IEmployee } from '@/types/type';

const useCanEditMock = vi.hoisted(() => vi.fn());

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

const baseRowData = (): EmployeeRowData => ({
  users,
  onViewDetails: vi.fn(),
  editingUserId: null,
  drafts: {},
  rowErrors: {},
  isSaving: false,
  onStartEdit: vi.fn(),
  onCancelEdit: vi.fn(),
  onDraftChange: vi.fn(),
  onSave: vi.fn(),
});

const renderRow = (rowData: EmployeeRowData = baseRowData()) =>
  render(
    <EmployeeRow
      ariaAttributes={{
        'aria-posinset': 1,
        'aria-setsize': users.length,
        role: 'listitem',
      }}
      index={0}
      style={{}}
      {...rowData}
    />,
  );

describe('EmployeeRow', () => {
  beforeEach(() => {
    useCanEditMock.mockReturnValue(true);
  });

  it('renders employee table cells and read-only actions', () => {
    const rowData = baseRowData();

    renderRow(rowData);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(rowData.onViewDetails).toHaveBeenCalledWith('1');

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(rowData.onStartEdit).toHaveBeenCalledWith(users[0]);
  });

  it('hides edit action when current user cannot edit the row', () => {
    useCanEditMock.mockReturnValue(false);

    renderRow();

    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('renders editable controls and reports draft changes', () => {
    const rowData = {
      ...baseRowData(),
      editingUserId: '1',
      drafts: {
        '1': {
          role: 'Manager',
          department: 'Frontend',
          building: 'HQ',
          room: '401',
          desk_number: '14',
          isRemoteWork: 'true',
          email: 'jane.doe@example.com',
        },
      },
    };

    renderRow(rowData);

    fireEvent.change(screen.getByDisplayValue('Frontend'), {
      target: { value: 'Backend' },
    });
    expect(rowData.onDraftChange).toHaveBeenCalledWith(
      '1',
      'department',
      'Backend',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(rowData.onSave).toHaveBeenCalledWith(users[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(rowData.onCancelEdit).toHaveBeenCalledWith('1');
  });
});
