import React from 'react';
import { IEmployee } from '../../types/type';

interface EmployeeListCardProps {
  user: IEmployee;
  onClick: (userId: string) => void;
}

export function EmployeeListCard({
  user,
  onClick,
}: EmployeeListCardProps): React.ReactElement {
  return (
    <div
      className="employee-row employee-item"
      data-id={user._id}
      onClick={() => onClick(user._id)}
    >
      <div className="wrapper">
        <img
          src={user.user_avatar}
          alt={user.first_name}
          className="employee-menu__img"
        />

        {user.isRemoteWork ? (
          <div className="home-box">
            <img
              src="/svgs/home-icon.svg"
              alt="home icon"
              className="home-box__list"
            />
          </div>
        ) : (
          ''
        )}
      </div>
      <p className="employee-menu__name">
        {user.first_name} {user.last_name}
      </p>
      <p className="employee-menu__department">{user.department}</p>
      <p className="employee-menu__room">{user.room}</p>
    </div>
  );
}
