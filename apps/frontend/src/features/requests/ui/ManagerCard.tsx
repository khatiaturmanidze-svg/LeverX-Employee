import React from 'react';
import { IManager } from '../../../types/type';
import { useGetUsersQuery } from '../../usersApi';
import { getUserById } from '@shared/lib';
import { LazyImage } from '@shared/ui';

interface ManagerCardProps {
  manager: IManager | undefined;
}

const ManagerCard: React.FC<ManagerCardProps> = ({ manager }) => {
  const managerId = manager?.id?.trim();
  const {
    data: allUsers = [],
    isLoading,
    isFetching,
    isError,
  } = useGetUsersQuery(undefined, { skip: !managerId });

  const managerInfo = getUserById(allUsers, managerId);

  if (!managerId) {
    return (
      <div className="manager_card">
        <div className="manager_card__no-manager">No manager assigned.</div>
      </div>
    );
  }

  if (!managerInfo) {
    return (
      <div className="manager_card">
        {isLoading || isFetching ? (
          <div className="manager_card__no-manager" role="status">
            Loading manager details...
          </div>
        ) : isError ? (
          <div className="manager_card__no-manager" role="alert">
            Could not load manager details.
          </div>
        ) : (
          <div className="manager_card__no-manager">
            Manager details are unavailable.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="manager_card">
      <LazyImage
        src={managerInfo.user_avatar || '/users/dumplinh.jpg'}
        alt="manager of user"
        className="manager_card__img"
        skeletonClassName="lazy-image--manager"
      />
      <div>
        <p className="manager_card__name">
          {managerInfo.first_name} {managerInfo.last_name}
        </p>
        <p className="manager_card__department">{managerInfo.department}</p>
      </div>
    </div>
  );
};

export default ManagerCard;
