import React from 'react';
import { vi } from 'vitest';
import type { AdvancedSearchCriteria, SearchCriteria } from '@features/search';
import type { EmployeeUpdate, IEmployee } from '../types/type';

export const useGetUsersQueryMock = vi.fn();
export const getLoggedInUserMock = vi.fn();
export const useRoleChangeMock = vi.fn();
export const signInMock = vi.fn();
export const signUpMock = vi.fn();
export const navigateMock = vi.fn();
export const getErrorMessageMock = vi.fn();
export const useParamsMock = vi.fn();
export const useGetEmployeeDetailsQueryMock = vi.fn();
export const useUpdateEmployeeMutationMock = vi.fn();
export const canEditMock = vi.fn();
export const updateEmployeeMock = vi.fn();

export let basicCriteriaValue: SearchCriteria = { fullname: '' };
export let advancedCriteriaValue: AdvancedSearchCriteria = {
  name: '',
  email: '',
  phone: '',
  zoom: '',
  building: 'any',
  room: '',
  department: 'any',
};

export const resetMainSearchCriteria = () => {
  basicCriteriaValue = { fullname: '' };
  advancedCriteriaValue = {
    name: '',
    email: '',
    phone: '',
    zoom: '',
    building: 'any',
    room: '',
    department: 'any',
  };
};

export const pagesUsersApiModule = {
  useGetUsersQuery: useGetUsersQueryMock,
};

export const pagesSharedLibModule = {
  getLoggedInUser: getLoggedInUserMock,
};

export const rolesSharedLibModule = {
  getLoggedInUser: getLoggedInUserMock,
  useRoleChange: useRoleChangeMock,
  useFilteredItems: (
    users: IEmployee[],
    value: string,
    filterFn: (user: IEmployee, term: string) => boolean,
  ) => users.filter((user) => filterFn(user, value)),
};

export const rolesSharedUiModule = {
  Header: ({
    loggedInUser,
    isAdmin,
  }: {
    loggedInUser: IEmployee | null;
    isAdmin?: boolean;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'header' },
      `header:${loggedInUser ? loggedInUser.role : 'no-user'}:${String(
        isAdmin,
      )}`,
    ),
};

export const rolesFeatureModule = {
  RolesEmployee: ({
    user,
    isAdmin,
    onRoleChange,
  }: {
    user: IEmployee;
    isAdmin: boolean;
    onRoleChange: (id: string, newRole: string) => void;
  }) =>
    React.createElement('div', { 'data-testid': 'role-employee' }, [
      `${user.first_name} ${user.last_name}:admin=${String(isAdmin)}`,
      React.createElement(
        'button',
        {
          key: 'btn',
          type: 'button',
          onClick: () => onRoleChange(user._id, 'HR'),
        },
        'change',
      ),
    ]),
};

export const mainSharedUiFactory = async (
  importOriginal: () => Promise<typeof import('@shared/ui')>,
) => {
  const actual = await importOriginal();

  return {
    ...actual,
    Header: () => React.createElement('header', null, 'Header'),
    EmployeeHeader: ({
      users,
      onViewChange,
    }: {
      users: IEmployee[];
      onViewChange: (mode: 'grid' | 'list') => void;
    }) =>
      React.createElement('div', { 'data-testid': 'employee-header' }, [
        React.createElement(
          'span',
          { key: 'count' },
          `employees:${users.length}`,
        ),
        React.createElement(
          'button',
          {
            key: 'toggle',
            type: 'button',
            onClick: () => onViewChange('list'),
          },
          'toggle-view',
        ),
      ]),
    EmployeeContainer: ({
      users,
      viewMode,
    }: {
      users: IEmployee[];
      viewMode: 'grid' | 'list';
    }) =>
      React.createElement(
        'div',
        { 'data-testid': 'employee-container' },
        `container:${users.length}:${viewMode}`,
      ),
  };
};

export const mainSearchFeatureFactory = async (
  importOriginal: () => Promise<typeof import('@features/search')>,
) => {
  const actual = await importOriginal();

  return {
    ...actual,
    __esModule: true,
    SearchBasic: ({
      onSearchSubmit,
    }: {
      onSearchSubmit: (criteria: SearchCriteria) => void;
    }) =>
      React.createElement('div', { 'data-testid': 'basic-search' }, [
        React.createElement(
          'button',
          {
            key: 'submit-basic',
            type: 'button',
            onClick: () => onSearchSubmit(basicCriteriaValue),
          },
          'submit-basic',
        ),
      ]),
    SearchAdvanced: ({
      onSearchSubmit,
    }: {
      onSearchSubmit: (criteria: AdvancedSearchCriteria) => void;
    }) =>
      React.createElement('div', { 'data-testid': 'advanced-search' }, [
        React.createElement(
          'button',
          {
            key: 'submit-advanced',
            type: 'button',
            onClick: () => onSearchSubmit(advancedCriteriaValue),
          },
          'submit-advanced',
        ),
      ]),
  };
};

export const requestsSharedUiModule = rolesSharedUiModule;

export const requestsFeatureFactory = async (
  importOriginal: () => Promise<typeof import('@features/requests')>,
) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Managers: ({ loggedInUser }: { loggedInUser: IEmployee | undefined }) =>
      React.createElement(
        'div',
        { 'data-testid': 'managers' },
        loggedInUser ? `managers:${loggedInUser.email}` : 'managers:no-user',
      ),
    RequestForm: () =>
      React.createElement('div', { 'data-testid': 'request-form' }),
    RequestList: () =>
      React.createElement('div', { 'data-testid': 'request-list' }),
  };
};

export const detailsRouterModule = {
  useParams: useParamsMock,
};

export const detailsUsersApiModule = {
  useGetUsersQuery: useGetUsersQueryMock,
  useGetEmployeeDetailsQuery: useGetEmployeeDetailsQueryMock,
  useUpdateEmployeeMutation: useUpdateEmployeeMutationMock,
};

export const detailsSharedLibModule = {
  getLoggedInUser: getLoggedInUserMock,
  canEdit: canEditMock,
};

export const detailsSharedUiFactory = async (
  importOriginal: () => Promise<typeof import('@shared/ui')>,
) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Header: () => React.createElement('header', null, 'Header'),
    AvatarSection: ({
      canEdit,
      onEditClick,
      onCopyLink,
    }: {
      canEdit: boolean;
      onEditClick: () => void;
      onCopyLink: () => void;
    }) =>
      React.createElement('section', { 'data-testid': 'avatar' }, [
        canEdit
          ? React.createElement(
              'button',
              {
                key: 'edit',
                type: 'button',
                className: 'avatar-section__edit',
                onClick: onEditClick,
              },
              'edit',
            )
          : null,
        React.createElement(
          'button',
          {
            key: 'copy',
            type: 'button',
            className: 'avatar-section__copy',
            onClick: onCopyLink,
          },
          'Copy link',
        ),
      ]),
    EmployeeView: () =>
      React.createElement(
        'div',
        { 'data-testid': 'employee-view' },
        'EmployeeView',
      ),
  };
};

export const detailsFeatureModule = {
  EmployeeEditForm: ({
    onCancel,
    onSaveSuccess,
  }: {
    onCancel: () => void;
    onSaveSuccess: (updated: EmployeeUpdate) => Promise<void> | void;
  }) =>
    React.createElement('div', { 'data-testid': 'employee-edit-form' }, [
      React.createElement(
        'button',
        { key: 'cancel', type: 'button', onClick: onCancel },
        'Cancel',
      ),
      React.createElement(
        'button',
        {
          key: 'save-success',
          type: 'button',
          onClick: () =>
            onSaveSuccess({
              department: 'IT-Updated',
            }),
        },
        'Save success',
      ),
    ]),
};

export const authPagesSharedUiModule = {
  SignHeader: () =>
    React.createElement('div', { 'data-testid': 'sign-header' }),
  SignMain: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'sign-main' }, children),
};

export const authPagesRouterModule = {
  useNavigate: () => navigateMock,
};

export const signInPageAuthApiModule = {
  useSignInMutation: () => [signInMock],
};

export const signUpPageAuthApiModule = {
  useSignUpMutation: () => [signUpMock],
};

export const authPagesSharedLibModule = {
  getErrorMessage: getErrorMessageMock,
};

export const rolesAllUsers: IEmployee[] = [
  {
    _id: 'u-1',
    role: 'Admin',
    user_avatar: '',
    first_name: 'Jane',
    last_name: 'Doe',
    department: 'IT',
    building: 'B',
    room: '1',
    desk_number: 1,
    isRemoteWork: false,
    phone: '+1',
    email: 'jane@example.com',
    zoom_id: 'z1',
    zoom_link: 'link',
    citizenship: 'US',
    manager: undefined,
    visa: [],
  },
  {
    _id: 'u-2',
    role: 'Employee',
    user_avatar: '',
    first_name: 'John',
    last_name: 'Smith',
    department: 'HR',
    building: 'B',
    room: '2',
    desk_number: 2,
    isRemoteWork: false,
    phone: '+2',
    email: 'john@example.com',
    zoom_id: 'z2',
    zoom_link: 'link',
    citizenship: 'US',
    manager: undefined,
    visa: [],
  },
];

export const mainUsers: IEmployee[] = [
  {
    _id: 'u-1',
    role: 'Employee',
    user_avatar: '',
    first_name: 'Jane',
    last_name: 'Doe',
    department: 'IT',
    building: 'A',
    room: '101',
    desk_number: 1,
    isRemoteWork: false,
    phone: '+1',
    email: 'jane@example.com',
    zoom_id: 'zoom1',
    zoom_link: 'link',
    citizenship: 'US',
  },
  {
    _id: 'u-2',
    role: 'Employee',
    user_avatar: '',
    first_name: 'John',
    last_name: 'Smith',
    department: 'HR',
    building: 'B',
    room: '102',
    desk_number: 2,
    isRemoteWork: false,
    phone: '+2',
    email: 'john@example.com',
    zoom_id: 'zoom2',
    zoom_link: 'link',
    citizenship: 'US',
  },
];

export const requestsAllUsers: IEmployee[] = [
  {
    _id: 'u-1',
    role: 'Admin',
    user_avatar: '',
    first_name: 'Admin',
    last_name: 'User',
    department: 'IT',
    building: 'B',
    room: '1',
    desk_number: 1,
    isRemoteWork: false,
    phone: '+1',
    email: 'admin@example.com',
    zoom_id: 'z',
    zoom_link: 'link',
    citizenship: 'US',
  },
];

export const detailsLoggedUser: IEmployee = {
  _id: 'logged-1',
  role: 'Admin',
  user_avatar: '',
  first_name: 'Admin',
  last_name: 'User',
  department: 'IT',
  building: 'B',
  room: '1',
  desk_number: 1,
  isRemoteWork: false,
  phone: '+1',
  email: 'admin@example.com',
  zoom_id: 'z',
  zoom_link: 'link',
  citizenship: 'US',
};

export const detailsViewedEmployee: IEmployee = {
  _id: 'emp-1',
  role: 'employee',
  user_avatar: '',
  first_name: 'Jane',
  last_name: 'Doe',
  department: 'IT',
  building: 'B',
  room: '101',
  desk_number: 7,
  isRemoteWork: false,
  phone: '+123',
  email: 'jane@example.com',
  zoom_id: 'zoom123',
  zoom_link: 'https://zoom.us/j/123',
  citizenship: 'US',
  first_native_name: 'Jane',
  last_native_name: 'Doe',
  date_birth: { year: 1990, month: 5, day: 15 },
  manager: { id: 'm-1', first_name: 'A', last_name: 'B' },
  visa: [],
};
