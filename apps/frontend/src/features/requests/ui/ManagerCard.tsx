import React from 'react';
import { IManager } from '../../../types/type';
import { useGetUsersQuery } from '../../usersApi';
import { getUserById } from '@shared/lib';
import { LazyImage } from '@shared/ui';

interface ManagerCardProps {
  manager: IManager | undefined;
}

const ManagerCard: React.FC<ManagerCardProps> = ({ manager }) => {
  const { data: allUsers = [] } = useGetUsersQuery();

  const managerInfo = getUserById(allUsers, manager?.id);
  return (
    <div className="manager_card">
      {!manager || Object.keys(manager).length === 0 ? (
        <div className="manager_card__no-manager">No manager assigned.</div>
      ) : (
        <>
          <LazyImage
            src={managerInfo?.user_avatar}
            alt="manager of user"
            className="manager_card__img"
            skeletonClassName="lazy-image--manager"
          />
          <div>
            <p className="manager_card__name">
              {managerInfo?.first_name} {managerInfo?.last_name}
            </p>
            <p className="manager_card__department">
              {managerInfo?.department}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerCard;
