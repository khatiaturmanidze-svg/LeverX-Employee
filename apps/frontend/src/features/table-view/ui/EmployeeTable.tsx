import React, { useState } from 'react';
import { List } from 'react-window';
import type {
  EditableEmployeeField,
  EmployeeDraft,
  EmployeeUpdate,
  IEmployee,
} from '@/types/type';
import { useUpdateEmployeeMutation } from '@/features/usersApi';
import EmployeeRow from './EmployeeRow';
import type { EmployeeRowData } from '../model/types';

interface EmployeeTableProps {
  users: IEmployee[];
  onViewDetails?: (userId: string) => void;
}

const TABLE_COLUMNS = [
  'Name',
  'Role',
  'Department',
  'Building',
  'Room',
  'Desk',
  'Email',
  'Manager',
  'Remote',
  'Actions',
];

const ROW_HEIGHT = 56;
const MAX_TABLE_HEIGHT = 560;
const TABLE_WIDTH = 'var(--employee-table-width)';

export default function EmployeeTable({
  users,
  onViewDetails,
}: EmployeeTableProps): React.ReactElement {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, EmployeeDraft>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();
  const visibleUsers = users.filter((user) => user.role !== 'Admin');

  const handleStartEdit = (user: IEmployee) => {
    setEditingUserId(user._id);
    setRowErrors((current) => ({ ...current, [user._id]: '' }));
    setDrafts((current) => ({
      ...current,
      [user._id]: {
        role: user.role,
        department: user.department,
        building: user.building,
        room: user.room,
        desk_number: user.desk_number?.toString() || '',
        isRemoteWork: String(user.isRemoteWork),
        email: user.email,
      },
    }));
  };

  const handleDraftChange = (
    userId: string,
    field: EditableEmployeeField,
    value: string,
  ) => {
    setDrafts((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [field]: value,
      },
    }));
  };

  const handleCancelEdit = (userId: string) => {
    setEditingUserId(null);
    setRowErrors((current) => ({ ...current, [userId]: '' }));
    setDrafts((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });
  };

  const handleSave = async (user: IEmployee) => {
    const draft = drafts[user._id];
    if (!draft) return;

    const email = draft.email?.trim() || '';
    const deskNumber = draft.desk_number?.trim() || '';

    if (!email) {
      setRowErrors((current) => ({
        ...current,
        [user._id]: 'Email is required.',
      }));
      return;
    }

    if (deskNumber && Number.isNaN(Number(deskNumber))) {
      setRowErrors((current) => ({
        ...current,
        [user._id]: 'Desk number must be a number.',
      }));
      return;
    }

    const update: EmployeeUpdate = {
      role: draft.role?.trim() || user.role,
      department: draft.department?.trim() || user.department,
      building: draft.building?.trim() || user.building,
      room: draft.room?.trim() || user.room,
      desk_number: deskNumber ? Number(deskNumber) : null,
      isRemoteWork: draft.isRemoteWork === 'true',
      email,
    };

    try {
      await updateEmployee({ id: user._id, update }).unwrap();
      handleCancelEdit(user._id);
    } catch {
      setRowErrors((current) => ({
        ...current,
        [user._id]: 'Could not save changes.',
      }));
    }
  };

  const rowData: EmployeeRowData = {
    users: visibleUsers,
    onViewDetails,
    editingUserId,
    drafts,
    rowErrors,
    isSaving: isLoading,
    onStartEdit: handleStartEdit,
    onCancelEdit: handleCancelEdit,
    onDraftChange: handleDraftChange,
    onSave: handleSave,
  };

  const tableHeight = Math.min(
    MAX_TABLE_HEIGHT,
    visibleUsers.length * ROW_HEIGHT,
  );

  return (
    <div className="employee-table" role="table" aria-label="Employees table">
      <div className="employee-table__scroll">
        <div className="employee-table__header" role="row">
          {TABLE_COLUMNS.map((column) => (
            <div
              key={column}
              className="employee-table__cell"
              role="columnheader"
            >
              {column}
            </div>
          ))}
        </div>

        {visibleUsers.length > 0 ? (
          <List<EmployeeRowData>
            className="employee-table__body"
            rowComponent={EmployeeRow}
            rowCount={visibleUsers.length}
            rowHeight={ROW_HEIGHT}
            rowProps={rowData}
            overscanCount={6}
            style={{ height: tableHeight, width: TABLE_WIDTH }}
          />
        ) : (
          <div className="employee-table__empty">No employees found.</div>
        )}
      </div>
    </div>
  );
}
