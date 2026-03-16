import React from 'react';
import { IManager } from '../../types/type';
import { useGetUsersQuery } from '../../features/usersApi';
import { getUserById } from '../../utils/core';
interface ManagerCardProps {
  manager: IManager;
}

const ManagerCard: React.FC<ManagerCardProps> = ({ manager }) => {
  const { data: allUsers = [] } = useGetUsersQuery();

  const managerInfo = getUserById(allUsers, manager.id);
  return (
    <div className="manager_card">
      <img
        src={managerInfo?.user_avatar}
        alt="manager of user"
        className="manager_card__img"
      />
      <div>
        <p className="manager_card__name">
          {managerInfo?.first_name} {managerInfo?.last_name}
        </p>
        <p className="manager_card__department">{managerInfo?.department}</p>
      </div>
    </div>
  );
};

export default ManagerCard;
