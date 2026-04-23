import React, { lazy, Suspense, useState, useMemo } from 'react';
import { Header, TabGroup } from '@shared/ui';
import type { AdvancedSearchCriteria } from '@features/search/ui/SearchAdvanced';
import type { SearchCriteria } from '@features/search/ui/SearchBasic';
import {
  filterUsers,
  filterAdvancedUsers,
} from '@features/search/lib/userFilters';
import { useGetHeaderProps } from '@shared/lib';
import { useGetUsersQuery } from '../features/usersApi';
import Loading from '@/shared/ui/Loading';
import { LazyImage } from '@shared/ui';

const EmployeeHeader = lazy(() => import('@shared/ui/EmployeeHeader'));

const EmployeeContainer = lazy(() => import('@shared/ui/EmployeeContainer'));

const SearchBasic = lazy(() => import('@features/search/ui/SearchBasic'));

const SearchAdvanced = lazy(() => import('@features/search/ui/SearchAdvanced'));

export default function Main(): React.ReactElement {
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [basicCriteria, setBasicCriteria] = useState<SearchCriteria | null>(
    null,
  );
  const [advancedCriteria, setAdvancedCriteria] =
    useState<AdvancedSearchCriteria | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: allUsers = [] } = useGetUsersQuery();
  const { loggedUser, isAdmin } = useGetHeaderProps();

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
          <Suspense fallback={<Loading />}>
            <EmployeeHeader users={filteredUsers} onViewChange={setViewMode} />
          </Suspense>
          <Suspense fallback={<Loading />}>
            {isBasicSearch ? (
              <SearchBasic onSearchSubmit={handleBasicSearch} />
            ) : (
              <SearchAdvanced onSearchSubmit={handleAdvancedSearch} />
            )}
          </Suspense>
          {filteredUsers.length === 0 ? (
            <LazyImage
              src="./svgs/not-found.jpg"
              alt="nothing found"
              className="nothing-found"
              skeletonClassName="lazy-image--empty-state"
            />
          ) : (
            <Suspense fallback={<Loading />}>
              <EmployeeContainer users={filteredUsers} viewMode={viewMode} />
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
}
