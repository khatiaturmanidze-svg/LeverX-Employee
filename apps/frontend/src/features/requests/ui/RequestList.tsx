import React, { useState, useEffect } from 'react';
import RequestListItem from './RequestListItem';
import { useGetRequestsQuery } from '../api/RequestsApi';
import { useParams } from 'react-router-dom';
import { LazyImage, TabGroup } from '@shared/ui';
import { getManagedEmployees } from '@shared/lib';
import { useGetUsersQuery, usersApi } from '../../usersApi';
import { useDispatch } from 'react-redux';
import { IRequestData } from '../model/state.types';

export default function RequestList(): React.ReactElement {
  const [requestType, setRequestType] = useState('');
  const [isPersonal, setIsPersonal] = useState(true);
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data: requests = [], isLoading: isRequestsLoading } =
    useGetRequestsQuery(id);
  const { data: allUsers = [], isLoading: isUsersLoading } = useGetUsersQuery();

  useEffect(() => {
    dispatch(usersApi.util.invalidateTags(['users']));
  }, []);

  const managedUsers = getManagedEmployees(allUsers);
  const teamRequests = managedUsers.flatMap((user) =>
    (user.requests ?? []).map((req) => ({
      ...req,
      employeeId: user._id,
      employeeName: `${user.first_name} ${user.last_name}`,
    })),
  );

  const currentDataSource = isPersonal ? requests : teamRequests;
  const isLoading = isPersonal ? isRequestsLoading : isUsersLoading;

  const visibleRequests = currentDataSource.filter((req) => {
    if (requestType === 'All types of requests' || requestType === '') {
      return true;
    }
    return req?.type.toLowerCase() === requestType.toLowerCase();
  });

  const tabs = [
    {
      id: 'personal-requests',
      label: 'personal requests',
      isActive: isPersonal,
      onClick: () => setIsPersonal(true),
      className: 'request-list__tab-personal',
    },
    {
      id: 'team-requests',
      label: 'team requests',
      isActive: !isPersonal,
      onClick: () => setIsPersonal(false),
      className: 'request-list__tab-team',
    },
  ];
  return (
    <div className="request-list card">
      <TabGroup
        containerClassName="request-list__tab"
        tabBaseClassName=""
        tabs={tabs}
        activeModifierClassName="request-list__tab-active"
      />
      <div className="flex--horizontal request-list__header">
        <p className="request-list__header">
          {isPersonal ? 'My leave requests' : 'Team leave requests'}
        </p>
        <select
          className="request-list__select"
          onChange={(e) => setRequestType(e.target.value)}
        >
          <option>All types of requests</option>
          <option>Sick leave</option>
          <option>Vacation</option>
          <option>Military leave</option>
        </select>
      </div>
      <div className="request-list__items">
        {isLoading ? (
          <div className="request-list__loading">Loading requests...</div>
        ) : visibleRequests.length > 0 ? (
          visibleRequests
            .filter((req): req is IRequestData => req !== undefined)
            .map((req) => (
              <RequestListItem
                key={req?.id}
                request={req}
                isPersonal={isPersonal}
              />
            ))
        ) : (
          <div className="request-list__empty">
            <LazyImage
              src="/assets/nothing-found.jpg"
              alt="nothing found"
              className="request-form__img"
              skeletonClassName="lazy-image--request"
            />
            <p className="request-list__nothing">
              No {requestType} requests found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
