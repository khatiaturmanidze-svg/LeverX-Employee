import React, { useState, useMemo } from 'react';
import { Header } from '../components/reusable/Header';
import BasicSearchForm from '../components/Main/SearchBasic';
import SearchAdvanced from '../components/Main/SearchAdvanced';
import EmployeeHeader from '../components/Main/EmployeeHeader';
import EmployeeContainer from '../components/Main/EmployeeContainer';
import { getLoggedInUser } from '../utils/core';
import { AdvancedSearchCriteria } from '../components/Main/SearchAdvanced';
import { useGetUsersQuery } from '../features/usersApi';
import { SearchCriteria } from '../components/Main/SearchBasic';
import { filterUsers, filterAdvancedUsers } from '../utils/userFilters';
import TabGroup from '../components/reusable/TabGroup';

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
            <BasicSearchForm onSearchSubmit={handleBasicSearch} />
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
