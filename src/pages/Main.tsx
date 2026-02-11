import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { IEmployee } from '../types/type';
import BasicSearchForm from '../components/Main/SearchBasic';
import SearchAdvanced from '../components/Main/SearchAdvanced';
import EmployeeHeader from '../components/Main/EmployeeHeader';
import EmployeeContainer from '../components/Main/EmployeeContainer';
import { getLoggedInUser } from '../core.tsx';
import { AdvancedSearchCriteria } from '../components/Main/SearchAdvanced';
import { useGetUsersQuery } from '../features/usersApi';
import { SearchCriteria } from '../components/Main/SearchBasic';

interface SearchToggleProps {
  isBasicSearch: boolean;
  onToggleMode: (isBasic: boolean) => void;
}

export function SearchToggle({
  isBasicSearch,
  onToggleMode,
}: SearchToggleProps): React.ReactElement {
  return (
    <div className="search flex--horizontal">
      <button
        className={`search__basic ${isBasicSearch ? 'active' : ''}`}
        onClick={() => onToggleMode(true)}
      >
        basic search
      </button>
      <button
        className={`search__advanced ${!isBasicSearch ? 'active' : ''}`}
        onClick={() => onToggleMode(false)}
      >
        advanced search
      </button>
    </div>
  );
}

const filterUsers = (
  users: IEmployee[],
  criteria: SearchCriteria
): IEmployee[] => {
  const searchFullName = criteria.fullname.trim().toLowerCase();

  if (!searchFullName) {
    return users;
  }

  return users.filter((u) =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchFullName)
  );
};
const filterAdvancedUsers = (
  users: IEmployee[],
  criteria: AdvancedSearchCriteria
): IEmployee[] => {
  const name = criteria.name?.trim().toLowerCase() || '';
  const email = criteria.email?.trim().toLowerCase() || '';
  const phone = criteria.phone?.trim() || '';
  const zoom = criteria.zoom?.trim() || '';
  const building = criteria.building?.trim().toLowerCase() || 'any';
  const room = criteria.room?.trim() || ''; // keep as string
  const department = criteria.department?.trim().toLowerCase() || 'any';

  return users.filter((u) => {
    const userFullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const userRoom = u.room?.toString() || '';

    return (
      (!name || userFullName.includes(name)) &&
      (!email || u.email.toLowerCase() === email) &&
      (!phone || u.phone === phone) &&
      (!zoom || u.zoom_id === zoom) &&
      (building === 'any' || u.building.toLowerCase() === building) &&
      (!room || userRoom === room) &&
      (department === 'any' || u.department.toLowerCase() === department)
    );
  });
};

export default function Main(): React.ReactElement {
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [basicCriteria, setBasicCriteria] = useState<SearchCriteria | null>(
    null
  );
  const [advancedCriteria, setAdvancedCriteria] =
    useState<AdvancedSearchCriteria | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: allUsers = [] } = useGetUsersQuery();

  const loggedUser = useMemo(
    () => getLoggedInUser(allUsers) || null,
    [allUsers]
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

  // const handleViewChange = (mode: 'grid' | 'list') => {
  //   setViewMode(mode);
  // };

  return (
    <>
      <Header loggedInUser={loggedUser} isAdmin={isAdmin} />
      <div className="page">
        <div className="grid-container">
          <SearchToggle
            isBasicSearch={isBasicSearch}
            onToggleMode={setIsBasicSearch}
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
