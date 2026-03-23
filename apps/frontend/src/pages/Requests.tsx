import React, { useMemo } from 'react';
import { Header } from '../shared/ui/Header';
import { getLoggedInUser } from '../shared/lib/core';
import { useGetUsersQuery } from '../features/usersApi';
import Managers from '../features/requests/ui/Managers';
import RequestForm from '../features/requests/ui/RequestForm';
import RequestList from '../features/requests/ui/RequestList';

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
