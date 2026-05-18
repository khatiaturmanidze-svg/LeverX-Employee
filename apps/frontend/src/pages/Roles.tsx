import React, { lazy, Suspense, useState } from 'react';
import { Header } from '@shared/ui';
import { useGetUsersQuery } from '../features/usersApi';
import {
  useFilteredItems,
  useRoleChange,
  useGetHeaderProps,
} from '@shared/lib';
import Loading from '@/shared/ui/Loading';

const RolesEmployee = lazy(async () => {
  const module = await import('@features/role-change/ui/RolesEmployee');
  return { default: module.RolesEmployee };
});

export default function Roles(): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: allUsers = [], isLoading: isUsersLoading } = useGetUsersQuery();
  const {
    loggedUser,
    isAdmin,
    isLoading: isHeaderLoading,
  } = useGetHeaderProps();

  const { handleRoleChange, error } = useRoleChange(loggedUser);

  const filteredUsers = useFilteredItems(
    allUsers,
    searchTerm,
    (user, term) =>
      user.first_name.toLowerCase().startsWith(term.toLowerCase()) ||
      user.last_name.toLowerCase().startsWith(term.toLowerCase()),
  );

  if (isUsersLoading || isHeaderLoading) {
    return <Loading />;
  }

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
          <p className="section-roles__admin">Admin</p>
          <Suspense fallback={<Loading />}>
            {filteredUsers.map((user) => (
              <RolesEmployee
                key={user._id}
                user={user}
                isAdmin={isAdmin}
                onRoleChange={handleRoleChange}
              />
            ))}
          </Suspense>
        </section>
      </main>
    </>
  );
}
