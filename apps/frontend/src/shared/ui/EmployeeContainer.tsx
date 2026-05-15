import React from 'react';
import { IEmployee } from '../../types/type';
import { useNavigate } from 'react-router-dom';
import ListHeader from './ListHeader';
import EmployeeCard from './EmployeeCard';
import { EmployeeTable } from '@features/table-view';
interface EmployeeHeaderProps {
  users: IEmployee[];
  viewMode: 'grid' | 'list' | 'table';
}

export default function EmployeeContainer({
  users,
  viewMode,
}: EmployeeHeaderProps): React.ReactElement {
  const isGrid = viewMode === 'grid';
  const isTable = viewMode === 'table';
  const isMenu = viewMode === 'list';
  const navigate = useNavigate();

  let containerClassName = 'employee-menu__container';

  if (isGrid) {
    containerClassName = 'employee-grid__container';
  } else if (isTable) {
    containerClassName = 'employee-table__container';
  }

  const handleEmployeeClick = (userId: string) => {
    navigate(`/details/${userId}`);
  };

  const employeeItems = users.map((user) => (
    <EmployeeCard
      key={user._id}
      user={user}
      variant={isGrid ? 'grid' : 'menu'}
      onClick={handleEmployeeClick}
    />
  ));

  return (
    <div className={containerClassName}>
      {isMenu && <ListHeader />}
      {isTable ? (
        <EmployeeTable users={users} onViewDetails={handleEmployeeClick} />
      ) : (
        employeeItems
      )}
    </div>
  );
}
