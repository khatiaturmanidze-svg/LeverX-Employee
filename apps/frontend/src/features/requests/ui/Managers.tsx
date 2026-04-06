import React from 'react';
import { IEmployee } from '../../../types/type';
import ManagerCard from './ManagerCard';

interface ManagersProps {
  loggedInUser: IEmployee | null;
}

export default function Managers({
  loggedInUser,
}: ManagersProps): React.ReactElement {
  const manager = loggedInUser?.manager;

  return (
    <div className="manager-wrapper card">
      <div className="manager_header">
        <p className="manager_header__heading">Leave Request Support</p>
        <p className="manager_header__subtext">
          Your dedicated manager is here to assist with leave requests
        </p>
      </div>
      <ManagerCard manager={manager} key={manager?.id} />
    </div>
  );
}
