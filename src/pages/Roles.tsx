import React, { useState, useMemo } from 'react';
import { getLoggedInUser, getErrorMessage } from '../core';
import { Header } from '../components/Header';
import { RolesEmployee } from '../components/Roles/RolesEmployee';
import {
  useGetUsersQuery,
  useUpdateEmployeeRoleMutation,
} from '../features/usersApi';

export default function Roles(): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { data: allUsers = [] } = useGetUsersQuery();
  const [updateRole] = useUpdateEmployeeRoleMutation();

  const loggedUser = useMemo(() => {
    return getLoggedInUser(allUsers) || null;
  }, [allUsers]);

  const isAdmin = useMemo(() => loggedUser?.role === 'Admin', [loggedUser]);

  const handleRoleChange = async (targetUser: string, newRole: string) => {
    if (!isAdmin) {
      setError('permission denied. only Admins can change roles.');
      return error;
    }
    setError(null);
    try {
      await updateRole({ id: targetUser, newRole }).unwrap();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter(
      (user) =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  return (
    <>
      <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
      <main>
        <section className="section-roles">
          <p className="section-roles__paragraph">Roles & permissions</p>
          <div className="section-roles__input">
            <input
              type="text"
              className="section-roles__search"
              placeholder="Type to search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="section-roles__book">Address book role</p>
          <p className="section-roles__vacation">Vacation role</p>
          <p className="section-roles__admin">Admin</p>{' '}
          {filteredUsers.map((user) => (
            <RolesEmployee
              key={user._id}
              user={user}
              onRoleChange={handleRoleChange}
              isAdmin={isAdmin}
            />
          ))}
        </section>
      </main>
    </>
  );
}
