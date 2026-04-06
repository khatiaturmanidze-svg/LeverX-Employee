import React from 'react';
import { Header } from '@shared/ui';
import { useHeaderProps } from '@shared/lib';
import { Managers, RequestForm, RequestList } from '@features/requests';

export default function Requests(): React.ReactElement {
  const { loggedInUser, isAdmin } = useHeaderProps();
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
