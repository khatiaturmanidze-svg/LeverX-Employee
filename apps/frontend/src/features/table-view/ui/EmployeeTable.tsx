import React from 'react';
import { List } from 'react-window';
import type { IEmployee } from '@/types/type';
import EmployeeRow, { type EmployeeRowData } from './EmployeeRow';

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
  'Email',
  'Manager',
  'Remote',
  'Actions',
];

const ROW_HEIGHT = 56;
const MAX_TABLE_HEIGHT = 560;

export default function EmployeeTable({
  users,
  onViewDetails,
}: EmployeeTableProps): React.ReactElement {
  const rowData: EmployeeRowData = {
    users,
    onViewDetails,
  };
  const tableHeight = Math.min(MAX_TABLE_HEIGHT, users.length * ROW_HEIGHT);

  return (
    <div className="employee-table" role="table" aria-label="Employees table">
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

      <List<EmployeeRowData>
        className="employee-table__body"
        rowComponent={EmployeeRow}
        rowCount={users.length}
        rowHeight={ROW_HEIGHT}
        rowProps={rowData}
        overscanCount={6}
        style={{ height: tableHeight, width: '100%' }}
      />
    </div>
  );
}
