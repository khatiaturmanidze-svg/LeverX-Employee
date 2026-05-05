import React from 'react';
import type { RowComponentProps } from 'react-window';
import { InputField } from '@/shared/ui';
import type { EditableEmployeeField } from '@/types/type';
import type { EmployeeRowData } from '../model/types';
import { useCanEdit } from '@/shared';

type EmployeeRowProps = RowComponentProps<EmployeeRowData>;

export default function EmployeeRow({
  index,
  style,
  users,
  onViewDetails,
  editingUserId,
  drafts,
  rowErrors,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onDraftChange,
  onSave,
}: EmployeeRowProps): React.ReactElement {
  const user = users[index];
  const isEditing = editingUserId === user._id;
  const draft = drafts[user._id] || {};
  const rowError = rowErrors[user._id];
  const getValue = (field: EditableEmployeeField) => {
    // If the user typed a draft value, show that instead of saved data so they can see their in-progress changes.
    if (draft[field] !== undefined) return draft[field];
    if (field === 'desk_number') return user.desk_number?.toString() || '';
    if (field === 'isRemoteWork') return String(user.isRemoteWork);
    return String(user[field] || '');
  };

  // Renders a table cell that switches between text and InputField.
  const renderEditableCell = (
    field: Exclude<EditableEmployeeField, 'isRemoteWork'>,
    type = 'text',
  ) => (
    <div className="employee-table__cell" role="cell">
      {isEditing ? (
        <InputField
          type={type}
          value={getValue(field)}
          onChange={(event) =>
            onDraftChange(user._id, field, event.target.value)
          }
        />
      ) : (
        getValue(field) || '-'
      )}
    </div>
  );

  return (
    <div
      className={`employee-table__row${isEditing ? ' employee-table__row--editing' : ''}`}
      style={style}
      role="row"
    >
      <div className="employee-table__cell" role="cell">
        {user.first_name} {user.last_name}
      </div>
      {renderEditableCell('role')}
      {renderEditableCell('department')}
      {renderEditableCell('building')}
      {renderEditableCell('room')}
      {renderEditableCell('desk_number', 'number')}
      {renderEditableCell('email', 'email')}
      <div className="employee-table__cell" role="cell">
        {user.manager
          ? `${user.manager.first_name} ${user.manager.last_name}`
          : '-'}
      </div>
      <div className="employee-table__cell" role="cell">
        {isEditing ? (
          <select
            className="edit-input"
            value={getValue('isRemoteWork')}
            onChange={(event) =>
              onDraftChange(user._id, 'isRemoteWork', event.target.value)
            }
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        ) : user.isRemoteWork ? (
          'Yes'
        ) : (
          'No'
        )}
      </div>
      <div className="employee-table__cell employee-table__actions" role="cell">
        {isEditing ? (
          <>
            <button
              type="button"
              className="employee-table__save-btn"
              onClick={() => onSave(user)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving' : 'Save'}
            </button>
            <button
              type="button"
              className="employee-table__cancel-btn"
              onClick={() => onCancelEdit(user._id)}
              disabled={isSaving}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="employee-table__details-btn"
              onClick={() => onViewDetails?.(user._id)}
            >
              Details
            </button>
            {useCanEdit(user) && (
              <button
                type="button"
                className="employee-table__edit-btn"
                onClick={() => onStartEdit(user)}
              >
                Edit
              </button>
            )}
          </>
        )}
      </div>
      {rowError && <p className="employee-table__error">{rowError}</p>}
    </div>
  );
}
