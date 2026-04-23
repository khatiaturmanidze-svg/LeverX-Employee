import React, { lazy, Suspense } from 'react';
import { Header } from '@shared/ui';
import { useGetHeaderProps } from '@shared/lib';
import Loading from '@/shared/ui/Loading';

const Managers = lazy(() => import('@features/requests/ui/Managers'));

const RequestForm = lazy(() => import('@features/requests/ui/RequestForm'));

const RequestList = lazy(() => import('@features/requests/ui/RequestList'));

export default function Requests(): React.ReactElement {
  const { loggedUser, isAdmin } = useGetHeaderProps();
  return (
    <div className="page">
      <Header loggedInUser={loggedUser || null} isAdmin={isAdmin} />{' '}
      <div className="requests-grid">
        <Suspense fallback={<Loading />}>
          <Managers loggedInUser={loggedUser} />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <RequestForm />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <RequestList />
        </Suspense>
      </div>
    </div>
  );
}
