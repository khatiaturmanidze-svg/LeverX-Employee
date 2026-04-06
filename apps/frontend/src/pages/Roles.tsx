import React, { useState } from 'react';
import { Header } from '@shared/ui';
import { RolesEmployee } from '@features/role-change';
import { useFilteredItems, useRoleChange, useHeaderProps } from '@shared/lib';
import { useGetUsersQuery } from '@/features/usersApi';

export default function Roles(): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: allUsers = [] } = useGetUsersQuery();
  const { loggedInUser, isAdmin } = useHeaderProps();

  const { handleRoleChange, error } = useRoleChange(loggedInUser);

  const filteredUsers = useFilteredItems(
    allUsers,
    searchTerm,
    (user, term) =>
      user.first_name.toLowerCase().startsWith(term.toLowerCase()) ||
      user.last_name.toLowerCase().startsWith(term.toLowerCase()),
  );

  return (
    <>
      <Header loggedInUser={loggedInUser} isAdmin={isAdmin} />
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
