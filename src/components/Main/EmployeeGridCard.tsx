import React from 'react';
import { IEmployee } from '../../types/type';

interface EmployeeGridCardProps {
  user: IEmployee;
  onClick: (userId: string) => void;
}

export function EmployeeGridCard({
  user,
  onClick,
}: EmployeeGridCardProps): React.ReactElement {
  return (
    <div
      className="employee-ind employee-item"
      data-id={user._id}
      onClick={() => onClick(user._id)}
    >
      <div className="wrapper">
        <img
          src={user.user_avatar}
          alt={user.first_name}
          className="employee-grid__img"
        />

        {user.isRemoteWork ? (
          <div className="home-box">
            <img
              src="/svgs/home-icon.svg"
              alt="home icon"
              className="home-box__grid"
            />
          </div>
        ) : (
          ''
        )}
      </div>
      <p className="employee-grid__name">
        {user.first_name} {user.last_name}
      </p>
      <span className="border"></span>
      <div className="employee--flex-container">
        <div className="employee--flex-item">
          <img
            src="svgs/briefcase-icon.svg"
            alt="briefcase icon"
            className="employee__icon"
          />
          <p className="employee-grid__job">{user.department}</p>
        </div>
        <div className="employee--flex-item">
          <img
            src="/svgs/door-icon.svg"
            alt="door-icon"
            className="employee__icon"
          />
          <p className="employee-grid__job">{user.room}</p>
        </div>
      </div>
    </div>
  );
}
