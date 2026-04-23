import React, { lazy, Suspense, useState, useMemo, useCallback } from 'react';
import { Header } from '@shared/ui';
import { canEdit } from '@shared/lib';
import { useParams } from 'react-router-dom';
import { useGetEmployeeDetailsQuery } from '../features/usersApi';
import { useGetHeaderProps } from '@shared/lib';
import Loading from '@/shared/ui/Loading';

const AvatarSection = lazy(() => import('@shared/ui/AvatarSection'));

const EmployeeView = lazy(async () => {
  const module = await import('@shared/ui/EmployeeView');
  return { default: module.EmployeeView };
});

const EmployeeEditForm = lazy(async () => {
  const module = await import('@features/edit/ui/EmployeeEditForm');
  return { default: module.EmployeeEditForm };
});

export default function Details(): React.ReactElement {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { loggedUser, isAdmin } = useGetHeaderProps();
  const { id } = useParams<{ id: string }>();

  const {
    data: viewedEmployee,
    isLoading,
    isFetching,
    isError,
  } = useGetEmployeeDetailsQuery(id!, { skip: !id });

  const canUserEdit = useMemo(() => {
    if (!loggedUser || !viewedEmployee) return false;
    return canEdit(loggedUser, viewedEmployee);
  }, [loggedUser, viewedEmployee]);

  const handleExitEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCopyLink = () => {
    if (
      localStorage.getItem('loggedInUser') ||
      sessionStorage.getItem('loggedInUser')
    ) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading || isFetching) {
    return (
      <>
        <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
        <main>
          <Loading />
        </main>
      </>
    );
  }

  if (isError || !viewedEmployee) {
    return (
      <>
        <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
        <main>
          <h1>Employee not found</h1>
        </main>
      </>
    );
  }

  return (
    <>
      <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
      <section className="user-details">
        <Suspense fallback={<Loading />}>
          <AvatarSection
            user={viewedEmployee}
            canEdit={canUserEdit}
            onEditClick={handleEditClick}
            onCopyLink={handleCopyLink}
          />
        </Suspense>

        <Suspense fallback={<Loading />}>
          {isEditing ? (
            <EmployeeEditForm user={viewedEmployee} onCancel={handleExitEdit} />
          ) : (
            <EmployeeView user={viewedEmployee} />
          )}
        </Suspense>
      </section>
    </>
  );
}
