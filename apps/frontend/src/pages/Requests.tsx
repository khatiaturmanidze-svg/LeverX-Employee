import React from 'react';
import { Header } from '@shared/ui';
import { useGetHeaderProps } from '@shared/lib';
import { Managers, RequestForm, RequestList } from '@features/requests';

export default function Requests(): React.ReactElement {
  const { loggedUser, isAdmin } = useGetHeaderProps();
  return (
    <div className="page">
      <Header loggedInUser={loggedUser || null} isAdmin={isAdmin} />{' '}
      <div className="requests-grid">
        <Managers loggedInUser={loggedUser} />
        <RequestForm />
        <RequestList />
      </div>
    </div>
  );
}
