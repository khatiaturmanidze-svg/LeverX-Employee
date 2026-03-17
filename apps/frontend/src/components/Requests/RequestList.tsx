import React, { useState } from 'react';
import RequestListItem from './RequestListItem';
import { useGetRequestsQuery } from '../../features/RequestsApi';
import { useParams } from 'react-router-dom';
import TabGroup from '../reusable/TabGroup';
import { getManagedEmployees } from '../../utils/core';
import { useGetUsersQuery, usersApi } from '../../features/usersApi';
import { IRequestData } from '../../types/type';
import { useDispatch } from 'react-redux';

export default function RequestList(): React.ReactElement {
  const [requestType, setRequestType] = useState('');
  const [isPersonal, setIsPersonal] = useState(true);
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data: requests = [] } = useGetRequestsQuery(id);
  const { data: allUsers = [] } = useGetUsersQuery();
  dispatch(usersApi.util.invalidateTags(['users']));

  const managedUsers = getManagedEmployees(allUsers);
  const teamRequests = managedUsers.flatMap((user) =>
    user.requests?.map((req) => ({
      ...req,
      employeeId: user._id,
      employeeName: `${user.first_name} ${user.last_name}`,
    })),
  );

  const currentDataSource = isPersonal ? requests : teamRequests;

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
      <div className="flex--horizontal ">
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
        {visibleRequests.length > 0 ? (
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
          <div>
            <img
              src="/assets/nothing-found.jpg"
              alt="nothing found"
              className="request-form__img"
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
