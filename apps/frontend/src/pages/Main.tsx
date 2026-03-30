import React, { useState, useMemo } from 'react';
import {
  Header,
  TabGroup,
  EmployeeContainer,
  EmployeeHeader,
} from '@shared/ui';
import {
  SearchBasic,
  SearchAdvanced,
  AdvancedSearchCriteria,
  SearchCriteria,
  filterUsers,
  filterAdvancedUsers,
} from '@features/search';
import { getLoggedInUser } from '@shared/lib';
import { useGetUsersQuery } from '../features/usersApi';

export default function Main(): React.ReactElement {
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [basicCriteria, setBasicCriteria] = useState<SearchCriteria | null>(
    null,
  );
  const [advancedCriteria, setAdvancedCriteria] =
    useState<AdvancedSearchCriteria | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: allUsers = [] } = useGetUsersQuery();

  const loggedUser = useMemo(
    () => getLoggedInUser(allUsers) || null,
    [allUsers],
  );

  const isAdmin = useMemo(() => loggedUser?.role === 'Admin', [loggedUser]);

  const filteredUsers = useMemo(() => {
    if (basicCriteria) {
      return filterUsers(allUsers, basicCriteria);
    }

    if (advancedCriteria) {
      return filterAdvancedUsers(allUsers, advancedCriteria);
    }

    return allUsers;
  }, [allUsers, basicCriteria, advancedCriteria]);

  const handleBasicSearch = (criteria: SearchCriteria) => {
    setAdvancedCriteria(null);
    setBasicCriteria(criteria);
  };

  const handleAdvancedSearch = (criteria: AdvancedSearchCriteria) => {
    setBasicCriteria(null);
    setAdvancedCriteria(criteria);
  };

  return (
    <>
      <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
      <div className="page">
        <div className="grid-container">
          <TabGroup
            containerClassName="search flex--horizontal"
            tabBaseClassName=""
            activeModifierClassName="active"
            tabs={[
              {
                id: 'basic',
                label: 'basic search',
                isActive: isBasicSearch,
                onClick: () => setIsBasicSearch(true),
                className: 'search__basic',
              },
              {
                id: 'advanced',
                label: 'advanced search',
                isActive: !isBasicSearch,
                onClick: () => setIsBasicSearch(false),
                className: 'search__advanced',
              },
            ]}
          />
          <EmployeeHeader users={filteredUsers} onViewChange={setViewMode} />
          {isBasicSearch ? (
            <SearchBasic onSearchSubmit={handleBasicSearch} />
          ) : (
            <SearchAdvanced onSearchSubmit={handleAdvancedSearch} />
          )}
          {filteredUsers.length === 0 ? (
            <img
              src="./svgs/not-found.jpg"
              alt="nothing found"
              className="nothing-found"
            />
          ) : (
            <EmployeeContainer users={filteredUsers} viewMode={viewMode} />
          )}
        </div>
      </div>
    </>
  );
}
