import React from 'react';
import { vi } from 'vitest';
import type { IEmployee } from '../../types/type';

export const sharedUiNavigateMock = vi.fn();

export const avatarSectionMockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  first_native_name: 'John',
  last_native_name: 'Doe',
  role: 'Engineer',
  user_avatar: '/avatar.png',
  isRemoteWork: true,
  department: 'Engineering',
  building: 'Building 1',
  room: 'Room 101',
  email: 'john.doe@example.com',
} as IEmployee;

export const employeeCardMockUser: IEmployee = {
  _id: '123',
  first_name: 'John',
  last_name: 'Doe',
  department: 'Engineering',
  room: '101',
  user_avatar: '',
  role: 'Engineer',
  building: '',
  email: '',
  isRemoteWork: false,
} as IEmployee;

export const employeeContainerMockUsers: IEmployee[] = [
  {
    _id: '1',
    first_name: 'John',
    last_name: 'Doe',
    department: 'Engineering',
    room: '101',
  } as IEmployee,
  {
    _id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    department: 'HR',
    room: '102',
  } as IEmployee,
];

export const employeeHeaderMockUsers: IEmployee[] = [
  { _id: '1', first_name: 'John', last_name: 'Doe' } as IEmployee,
  { _id: '2', first_name: 'Jane', last_name: 'Smith' } as IEmployee,
];

export const employeeViewMockUser: IEmployee = {
  _id: '1',
  role: 'Employee',
  user_avatar: '/svgs/avatar',
  first_name: 'John',
  last_name: 'Doe',
  department: 'Engineering',
  building: 'Building 1',
  room: '101',
  desk_number: 12,
  phone: '123-456-7890',
  email: 'john.doe@example.com',
  citizenship: 'USA',
  isRemoteWork: true,
  date_birth: { year: 1999, month: 1, day: 1 },
  manager: {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
  },
  visa: [
    {
      issuing_country: 'Canada',
      type: 'Work',
      start_date: '2023-01-01',
      end_date: '2024-01-01',
    },
  ],
} as IEmployee;

export const headerMockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  department: 'Engineering',
  building: 'Building 1',
  room: '101',
  email: 'john.doe@example.com',
} as IEmployee;

export const headerTabsMockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  role: 'Admin',
  user_avatar: '/avatar.png',
  department: 'Engineering',
  building: 'HQ',
  room: '101',
  phone: '123456',
  email: 'john.doe@example.com',
} as IEmployee;

export const loggedInUserMockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  user_avatar: '/avatar.png',
} as IEmployee;

export const wrapperMockUser: IEmployee = {
  _id: '1',
  first_name: 'John',
  last_name: 'Doe',
  role: 'Engineer',
  user_avatar: '/avatar.png',
  isRemoteWork: true,
  department: 'Engineering',
  building: 'Building 1',
  room: 'Room 101',
  email: 'john.doe@example.com',
} as IEmployee;

export const employeeCardWrapperModule = {
  default: () => <div data-testid="wrapper" />,
};

type MockEmployeeCardProps = {
  user: IEmployee;
  onClick: (id: string) => void;
};

export const employeeContainerRouterModule = {
  useNavigate: () => sharedUiNavigateMock,
};

export const employeeContainerEmployeeCardModule = {
  default: ({ user, onClick }: MockEmployeeCardProps) => (
    <div data-testid="employee-card" onClick={() => onClick(user._id)}>
      {user.first_name}
    </div>
  ),
};

export const employeeContainerListHeaderModule = {
  default: () => <div data-testid="list-header" />,
};

type Tab = {
  id: string;
  onClick: () => void;
  isActive: boolean;
  className?: string;
  label?: React.ReactNode;
};

export const employeeHeaderSharedUiModule = {
  Icon: ({ alt }: { alt: string }) => <img alt={alt} />,
  TabGroup: ({ tabs }: { tabs: Tab[] }) => (
    <div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-testid={`tab-${tab.id}`}
          aria-pressed={tab.isActive}
          onClick={tab.onClick}
        >
          {tab.id}
        </button>
      ))}
    </div>
  ),
};

export const employeeViewFeaturesEditFactory = async (
  importOriginal: () => Promise<typeof import('@features/edit')>,
) => {
  const actual = await importOriginal();
  return {
    ...actual,
    DetailRow: ({ label, value }: { label: string; value: string }) => (
      <div data-testid={`detail-${label.replace(/\s+/g, '-')}`}>
        <span>{label}</span>: <span>{value}</span>
      </div>
    ),
  };
};

export const headerLogoModule = { default: () => <div data-testid="logo" /> };
export const headerBtnLogOffModule = {
  default: () => <button>Log Off</button>,
};
export const headerBtnSupportModule = {
  default: () => <button>Support</button>,
};
export const headerLoggedInUserModule = {
  default: ({ loggedInUser }: { loggedInUser: IEmployee | null }) => (
    <div data-testid="logged-user">{loggedInUser?.first_name || 'Guest'}</div>
  ),
};
export const headerTabsModule = {
  default: ({ isAdmin }: { isAdmin?: boolean }) => (
    <div data-testid="header-tabs">{isAdmin ? 'Admin Tabs' : 'User Tabs'}</div>
  ),
};

export const headerTabsRouterModule = {
  useNavigate: () => sharedUiNavigateMock,
  useLocation: () => ({ pathname: '/main' }),
};

export const loggedInUserRouterModule = headerTabsRouterModule;

export const signHeaderRouterFactory = async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => sharedUiNavigateMock,
  };
};
