import React from 'react';
import { vi } from 'vitest';
import type { IRequestData } from '../model/state.types';

export const useGetUsersQueryMock = vi.fn();
export const getUserByIdMock = vi.fn();
export const useAddRequestMutationMock = vi.fn();
export const validateRequestMock = vi.fn();
export const getErrorMessageMock = vi.fn();
export const getLoggedInUserMock = vi.fn();
export const addRequestMock = vi.fn();
export const useGetRequestsQueryMock = vi.fn();
export const useParamsMock = vi.fn();
export const useDispatchMock = vi.fn();
export const getManagedEmployeesMock = vi.fn();
export const invalidateTagsMock = vi.fn(() => ({ type: 'invalidate' }));
export const invalidateUsersTagsMock = vi.fn(() => ({
  type: 'invalidate-users',
}));
export const useGetManagerMock = vi.fn();
export const useUpdateRequestMutationMock = vi.fn();
export const updateRequestMock = vi.fn();
export const getDisplayStatusMock = vi.fn(() => 'pending');

export const managerCardUsersApiModule = {
  useGetUsersQuery: useGetUsersQueryMock,
};

export const managerCardSharedLibModule = {
  getUserById: getUserByIdMock,
};

export const managersManagerCardModule = {
  default: () => React.createElement('div', null, 'No manager assigned.'),
};

export const requestFormUsersApiModule = {
  useGetUsersQuery: useGetUsersQueryMock,
};

export const requestFormApiModule = {
  useAddRequestMutation: useAddRequestMutationMock,
};

export const requestFormSharedLibModule = {
  validateRequest: validateRequestMock,
  getErrorMessage: getErrorMessageMock,
  getLoggedInUser: getLoggedInUserMock,
};

export const requestListApiModule = {
  useGetRequestsQuery: useGetRequestsQueryMock,
};

export const requestListUsersApiModule = {
  useGetUsersQuery: useGetUsersQueryMock,
  usersApi: {
    util: {
      invalidateTags: invalidateTagsMock,
    },
  },
};

export const requestListRouterModule = {
  useParams: useParamsMock,
};

export const requestListReduxModule = {
  useDispatch: useDispatchMock,
};

export const requestListSharedLibModule = {
  getManagedEmployees: getManagedEmployeesMock,
};

export const requestListSharedUiModule = {
  LazyImage: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => React.createElement('img', { src, alt, className }),
  TabGroup: ({
    tabs,
  }: {
    tabs: { id: string; label: string; onClick: () => void }[];
  }) =>
    React.createElement(
      'div',
      null,
      tabs.map((tab) =>
        React.createElement(
          'button',
          { key: tab.id, type: 'button', onClick: tab.onClick },
          tab.label,
        ),
      ),
    ),
};

export const requestListItemModule = {
  default: ({
    request,
    isPersonal,
  }: {
    request: { id: string; type: string };
    isPersonal: boolean;
  }) =>
    React.createElement(
      'div',
      { className: 'request-item-mock' },
      `${request.id}:${request.type}:${isPersonal ? 'personal' : 'team'}`,
    ),
};

export const requestListItemReduxModule = {
  useDispatch: useDispatchMock,
};

export const requestListItemApiModule = {
  useUpdateRequestMutation: useUpdateRequestMutationMock,
};

export const requestListItemUsersApiModule = {
  usersApi: {
    util: {
      invalidateTags: invalidateUsersTagsMock,
    },
  },
};

export const requestListItemSharedLibModule = {
  getDisplayStatus: getDisplayStatusMock,
  useGetManager: useGetManagerMock,
};

export const baseRequest: IRequestData = {
  id: 'req-1',
  employeeId: 'emp-1',
  type: 'Vacation',
  start_date: '2026-06-01',
  end_date: '2026-06-05',
  note: 'Trip',
  status: 'pending',
};
