import React, { useState, useMemo, useCallback } from "react";
import { Header } from "../components/reusable/Header.tsx";
import { getLoggedInUser, canEdit } from "../utils/core";
import { useParams } from "react-router-dom";
import AvatarSection from "../components/Details/AvatarSection";
import { EmployeeView } from "../components/Details/EmployeeView";
import { EmployeeEditForm } from "../components/Details/EmployeeEditForm";
import {
  useGetEmployeeDetailsQuery,
  useGetUsersQuery,
  useUpdateEmployeeMutation,
} from "../features/usersApi.ts";
import { EmployeeUpdate } from "../types/type.tsx";

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

  const isAdmin = useMemo(() => loggedUser?.role === "Admin", [loggedUser]);

  const canUserEdit = useMemo(() => {
    if (!viewedEmployee) return false;
    return canEdit(loggedUser!, viewedEmployee);
  }, [loggedUser, viewedEmployee]);

  const handleExitEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCopyLink = () => {
    if (
      localStorage.getItem("loggedInUser") ||
      sessionStorage.getItem("loggedInUser")
    )
      navigator.clipboard.writeText(window.location.href);
  };

  const handleSaveSuccess = async (updated: EmployeeUpdate) => {
    await updateEmployee({ id: viewedEmployee!._id, update: updated }).unwrap();
    setIsEditing(false);
  };

  const employeeData = viewedEmployee;
  if (!viewedEmployee) {
    return (
      <>
        <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
        <main>
          <h1>Loading Employee Details...</h1>
        </main>
      </>
    );
  }
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
          user={employeeData!}
          canEdit={canUserEdit}
          onEditClick={handleEditClick}
          onCopyLink={handleCopyLink}
        />

        {isEditing ? (
          <EmployeeEditForm
            user={employeeData!}
            onCancel={handleExitEdit}
            onSaveSuccess={handleSaveSuccess}
          />
        ) : (
          <EmployeeView user={employeeData!} />
        )}
      </section>
    </>
  );
}
