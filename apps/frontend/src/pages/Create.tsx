import React from 'react';
import { CreateUserForm, CreateUserUpload } from '@features/create-user';
import { Header } from '@/shared/ui/Header';
import { useGetHeaderProps } from '@shared/lib';

export default function Create(): React.ReactElement {
  const { loggedUser, isAdmin } = useGetHeaderProps();
  return (
    <div className="create-page">
      <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
      <div className="create-user-page">
        <CreateUserForm />
        <CreateUserUpload />
      </div>
    </div>
  );
}
