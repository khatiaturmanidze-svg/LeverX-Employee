import React from 'react';
import { IEmployee } from '../../types/type';
import { useNavigate } from 'react-router-dom';
import ListHeader from './ListHeader';
import EmployeeCard from './EmployeeCard';
import EmployeeTable from '@features/table-view/ui/EmployeeTable';
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
    <div
      className={
        isGrid ? 'employee-grid__container' : 'employee-menu__container'
      }
    >
      {isMenu && <ListHeader />}
      {isTable ? <EmployeeTable /> : employeeItems}
    </div>
  );
}
