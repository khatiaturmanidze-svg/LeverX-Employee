import React, { useState, useMemo } from "react";
import { getLoggedInUser, getErrorMessage } from "../utils/core";
import { Header } from "../components/reusable/Header";
import { RolesEmployee } from "../components/Roles/RolesEmployee";
import {
  useGetUsersQuery,
  useUpdateEmployeeRoleMutation,
} from "../features/usersApi";

import Search from "../components/reusable/Search";

export default function Roles(): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: allUsers = [] } = useGetUsersQuery();
  const [updateRole] = useUpdateEmployeeRoleMutation();

  const loggedUser = useMemo(() => {
    return getLoggedInUser(allUsers) || null;
  }, [allUsers]);

  const isAdmin = useMemo(() => loggedUser?.role === "Admin", [loggedUser]);

  const handleRoleChange = async (targetUser: string, newRole: string) => {
    if (!isAdmin) {
      setError("permission denied. only Admins can change roles.");
      return error;
    }
    setError(null);
    try {
      await updateRole({ id: targetUser, newRole }).unwrap();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };
  return (
    <>
      <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
      <main>
        <section className="section-roles">
          <p className="section-roles__paragraph">Roles & permissions</p>
          <Search
            items={allUsers}
            value={searchTerm}
            onChange={setSearchTerm}
            filterFn={(user, term) =>
              user.first_name.toLowerCase().startsWith(term.toLowerCase()) ||
              user.last_name.toLowerCase().startsWith(term.toLowerCase())
            }
            renderInput={(value, onChange) => (
              <div className="section-roles__input">
                <input
                  type="text"
                  className="section-roles__search"
                  placeholder="Type to search"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            )}
          >
            {(filteredUsers) => (
              <>
                <p className="section-roles__book">Address book role</p>
                <p className="section-roles__vacation">Vacation role</p>
                <p className="section-roles__admin">Admin</p>
                {filteredUsers.map((user) => (
                  <RolesEmployee
                    key={user._id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    isAdmin={isAdmin}
                  />
                ))}
              </>
            )}
          </Search>
        </section>
      </main>
    </>
  );
}
