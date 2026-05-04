import React from 'react';
import type { RowComponentProps } from 'react-window';
import type { IEmployee } from '@/types/type';

export interface EmployeeRowData {
  users: IEmployee[];
  onViewDetails?: (userId: string) => void;
}

type EmployeeRowProps = RowComponentProps<EmployeeRowData>;

export default function EmployeeRow({
  index,
  style,
  users,
  onViewDetails,
}: EmployeeRowProps): React.ReactElement {
  const user = users[index];

  return (
    <div className="employee-table__row" style={style} role="row">
      <div className="employee-table__cell" role="cell">
        {user.first_name} {user.last_name}
      </div>
      <div className="employee-table__cell" role="cell">
        {user.role}
      </div>
      <div className="employee-table__cell" role="cell">
        {user.department}
      </div>
      <div className="employee-table__cell" role="cell">
        {user.building}
      </div>
      <div className="employee-table__cell" role="cell">
        {user.room}
      </div>
      <div className="employee-table__cell" role="cell">
        {user.email}
      </div>
      <div className="employee-table__cell" role="cell">
        {user.manager
          ? `${user.manager.first_name} ${user.manager.last_name}`
          : '-'}
      </div>
      <div className="employee-table__cell" role="cell">
        {user.isRemoteWork ? 'Yes' : 'No'}
      </div>
      <div className="employee-table__cell employee-table__actions" role="cell">
        <button
          type="button"
          className="employee-table__details-btn"
          onClick={() => onViewDetails?.(user._id)}
        >
          Details
        </button>
      </div>
    </div>
  );
}
