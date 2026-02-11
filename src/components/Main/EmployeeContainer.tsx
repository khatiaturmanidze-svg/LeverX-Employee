import React from 'react';
import { IEmployee } from '../../types/type';
import { EmployeeGridCard } from './EmployeeGridCard';
import { EmployeeListCard } from './EmployeeListCard';
import { useNavigate } from 'react-router-dom';
interface EmployeeHeaderProps {
  users: IEmployee[];
  viewMode: 'grid' | 'list';
}

export default function EmployeeContainer({
  users,
  viewMode,
}: EmployeeHeaderProps): React.ReactElement {
  const isGrid = viewMode === 'grid';
  const navigate = useNavigate();

  const handleEmployeeClick = (userId: string) => {
    navigate(`/details/${userId}`);
  };

  const ListHeadr = (
    <div className="first-row">
      <div className="flex--horizontal">
        <img src="/svgs/circle-icon.svg" alt="photo icon" className="icon" />
        <p>Photo</p>
      </div>

      <div className="flex--horizontal">
        <img src="/svgs/user-icon.svg" alt="user icon" className="icon" />
        <p>Name</p>
      </div>

      <div className="flex--horizontal">
        <img
          src="/svgs/briefcase-icon.svg"
          alt="department icon"
          className="icon"
        />
        <p>Department</p>
      </div>

      <div className="flex--horizontal">
        <img src="/svgs/door-icon.svg" alt="room icon" className="icon" />
        <p>Room</p>
      </div>
    </div>
  );

  const employeeItems = users.map((user) =>
    isGrid ? (
      <EmployeeGridCard
        key={user._id}
        user={user}
        onClick={handleEmployeeClick}
      />
    ) : (
      <EmployeeListCard
        key={user._id}
        user={user}
        onClick={handleEmployeeClick}
      />
    )
  );

  return (
    <div className={isGrid ? 'employee-grid' : 'employee-menu'}>
      {!isGrid && ListHeadr}
      {employeeItems}
    </div>
  );
}
