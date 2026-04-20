import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IEmployee } from '../../types/type';
import TabGroup from './TabGroup';

interface HeaderTabsProps {
  isAdmin?: boolean;
  loggedInUser: IEmployee | null;
  containerClassName?: string;
}

export default function HeaderTabs({
  isAdmin,
  loggedInUser,
  containerClassName = 'tab-container',
}: HeaderTabsProps): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  const isAddressBook = location.pathname.startsWith('/main');
  const isSettings = location.pathname.startsWith('/roles');
  const isRequests = location.pathname.startsWith('/requests');
  const isCreate = location.pathname.startsWith('/create');

  const tabs = [
    {
      id: 'address-book',
      label: 'Address Book',
      isActive: isAddressBook,
      onClick: () => navigate('/main'),
      className: 'header__address-book',
    },
    ...(isAdmin
      ? [
          {
            id: 'settings',
            label: 'Settings',
            isActive: isSettings,
            onClick: () => {
              if (loggedInUser?.role === 'Admin') navigate('/roles');
            },
            className: 'header__settings-btn',
          },
        ]
      : []),
    {
      id: 'requests',
      label: 'Requests',
      isActive: isRequests,
      onClick: () => navigate(`/requests/${loggedInUser?._id}`),
      className: 'header__requests-btn',
    },

    ...(isAdmin
      ? [
          {
            id: 'create',
            label: 'Create',
            isActive: isCreate,
            onClick: () => navigate('/create'),
            className: 'header__create-btn',
          },
        ]
      : []),
  ];

  return (
    <TabGroup
      containerClassName={containerClassName}
      tabBaseClassName=""
      activeModifierClassName="active-tab"
      tabs={tabs}
    />
  );
}
