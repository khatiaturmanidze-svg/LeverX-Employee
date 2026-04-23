import React, { lazy, Suspense } from 'react';
import { Header } from '@/shared/ui/Header';
import { useGetHeaderProps } from '@shared/lib';
import Loading from '@/shared/ui/Loading';

const CreateUserForm = lazy(
  () => import('@features/create-user/ui/CreateUserForm'),
);

const CreateUserUpload = lazy(
  () => import('@features/create-user/ui/CreateUserUpload'),
);

export default function Create(): React.ReactElement {
  const { loggedUser, isAdmin } = useGetHeaderProps();
  return (
    <div className="create-page">
      <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
      <div className="create-user-page">
        <Suspense fallback={<Loading />}>
          <CreateUserForm />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <CreateUserUpload />
        </Suspense>
      </div>
    </div>
  );
}
