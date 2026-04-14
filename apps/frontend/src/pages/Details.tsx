import React, { useState, useMemo, useCallback } from 'react';
import { Header, AvatarSection, EmployeeView } from '@shared/ui';
import { getLoggedInUser, canEdit } from '@shared/lib';
import { useParams } from 'react-router-dom';
import { EmployeeEditForm } from '@features/edit';
import {
  useGetEmployeeDetailsQuery,
  useGetUsersQuery,
  useUpdateEmployeeMutation,
} from '../features/usersApi';
import { EmployeeUpdate } from '../types/type';

export default function Details(): React.ReactElement {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { id } = useParams<{ id: string }>();
  const { data: allUsers = [] } = useGetUsersQuery();

  const {
    data: viewedEmployee,
    isLoading: employeeLoading,
    isError,
  } = useGetEmployeeDetailsQuery(id!, { skip: !id });
  const [updateEmployee] = useUpdateEmployeeMutation();

  const loggedUser = useMemo(() => {
    return getLoggedInUser(allUsers) || null;
  }, [allUsers]);

  const isAdmin = useMemo(() => loggedUser?.role === 'Admin', [loggedUser]);

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

  const handleSaveSuccess = async (updated: EmployeeUpdate) => {
    if (!viewedEmployee) return;
    await updateEmployee({
      id: viewedEmployee._id,
      update: updated,
    }).unwrap();
    setIsEditing(false);
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
          <EmployeeEditForm
            user={viewedEmployee}
            onCancel={handleExitEdit}
            onSaveSuccess={handleSaveSuccess}
          />
        ) : (
          <EmployeeView user={viewedEmployee} />
        )}
      </section>
    </>
  );
}
