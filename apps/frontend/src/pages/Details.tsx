import React, { useState, useMemo, useCallback } from 'react';
import { Header, AvatarSection, EmployeeView } from '@shared/ui';
import { canEdit } from '@shared/lib';
import { useParams } from 'react-router-dom';
import { EmployeeEditForm } from '@features/edit';
import { useGetEmployeeDetailsQuery } from '../features/usersApi';
import { useGetHeaderProps } from '@shared/lib';

export default function Details(): React.ReactElement {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { loggedUser, isAdmin } = useGetHeaderProps();
  const { id } = useParams<{ id: string }>();

  const {
    data: viewedEmployee,
    isLoading: employeeLoading,
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

  if (employeeLoading) {
    return (
      <>
        <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
        <main>
          <h1>Loading Employee Details...</h1>
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
        <AvatarSection
          user={viewedEmployee}
          canEdit={canUserEdit}
          onEditClick={handleEditClick}
          onCopyLink={handleCopyLink}
        />

        {isEditing ? (
          <EmployeeEditForm user={viewedEmployee} onCancel={handleExitEdit} />
        ) : (
          <EmployeeView user={viewedEmployee} />
        )}
      </section>
    </>
  );
}
