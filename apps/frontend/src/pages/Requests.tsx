import React, { useMemo } from 'react';
import { Header } from '@shared/ui';
import { getLoggedInUser } from '@shared/lib';
import { useGetUsersQuery } from '../features/usersApi';
import { Managers, RequestForm, RequestList } from '@features/requests';

export default function Requests(): React.ReactElement {
  const { data: allUsers = [] } = useGetUsersQuery();
  const loggedInUser = useMemo(() => {
    return getLoggedInUser(allUsers);
  }, [allUsers]);
  const isAdmin = loggedInUser?.role === 'Admin';
  return (
    <div className="page">
      <Header loggedInUser={loggedInUser || null} isAdmin={isAdmin} />{' '}
      <div className="requests-grid">
        <Managers loggedInUser={loggedInUser} />
        <RequestForm />
        <RequestList />
      </div>
    </div>
  );
}
