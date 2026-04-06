import { Header } from '@/shared';
import React from 'react';
import { useHeaderProps } from '@shared/lib';

export default function CreateUser(): React.ReactElement {
  const { loggedInUser, isAdmin } = useHeaderProps();
  return (
    <>
      <Header loggedInUser={loggedInUser} isAdmin={isAdmin} />
      <div>Create User </div>
    </>
  );
}
