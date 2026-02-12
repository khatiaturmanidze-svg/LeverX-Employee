import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IEmployee } from '../../types/type';
import TabGroup from './TabGroup';

interface HeaderTabsProps {
  isAdmin?: boolean;
  loggedInUser: IEmployee | null;
}

export default function HeaderTabs({
  isAdmin,
  loggedInUser,
}: HeaderTabsProps): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  const isAddressBook = location.pathname.startsWith('/main');
  const isSettings = location.pathname.startsWith('/roles');
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
  ];

  return (
    <TabGroup
      containerClassName="tab-container"
      tabBaseClassName=""
      activeModifierClassName="active-tab"
      tabs={tabs}
    />
  );
}
