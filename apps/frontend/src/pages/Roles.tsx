import React, { useState, useMemo } from 'react';
import { getLoggedInUser } from '../shared/lib/core';
import { Header } from '../shared/ui/Header';
import { RolesEmployee } from '../features/role-change/ui/RolesEmployee';
import { useGetUsersQuery } from '../features/usersApi';
import { useFilteredItems, useRoleChange } from '../shared/lib/customHooks';

export default function Roles(): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: allUsers = [] } = useGetUsersQuery();

  const loggedUser = useMemo(() => {
    return getLoggedInUser(allUsers) || null;
  }, [allUsers]);

  const isAdmin = useMemo(() => loggedUser?.role === 'Admin', [loggedUser]);

  const { handleRoleChange, error } = useRoleChange(loggedUser);

  const filteredUsers = useFilteredItems(
    allUsers,
    searchTerm,
    (user, term) =>
      user.first_name.toLowerCase().startsWith(term.toLowerCase()) ||
      user.last_name.toLowerCase().startsWith(term.toLowerCase()),
  );

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
          {error && <p className="section-roles__error">{error}</p>}
          <p className="section-roles__book">Address book role</p>
          <p className="section-roles__vacation">Vacation role</p>
          <p className="section-roles__admin">Admin</p>
          {filteredUsers.map((user) => (
            <RolesEmployee
              key={user._id}
              user={user}
              isAdmin={isAdmin}
              onRoleChange={handleRoleChange}
            />
          ))}
        </section>
      </main>
    </>
  );
}
