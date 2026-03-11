import React from 'react';
import { IEmployee } from '../../types/type';
import Wrapper from './Wrapper';

type EmployeeCardVariant = 'grid' | 'menu';

interface EmployeeCardProps {
  user: IEmployee;
  variant: EmployeeCardVariant;
  key: string;
  onClick: (userId: string) => void;
}

export default function EmployeeCard({
  user,
  variant,
  onClick,
  key,
}: EmployeeCardProps): React.ReactElement {
  return (
    <div
      // employee-row / employee-ind
      className={`employee-${variant} employee-item`}
      data-id={user._id}
      onClick={() => onClick(user._id)}
      key={key}
    >
      <Wrapper display={variant} user={user} />
      <p className={`employee-${variant}__name`}>
        {user.first_name} {user.last_name}
      </p>
      {variant === 'grid' ? (
        <>
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
        </>
      ) : (
        <>
          <p className={`employee-${variant}__department`}>{user.department}</p>
          <p className={`employee-${variant}__room`}>{user.room}</p>
        </>
      )}
    </div>
  );
}
