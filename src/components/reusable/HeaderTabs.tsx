import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IEmployee } from '../../types/type';

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
  return (
    <div className="tab-container">
      <button
        className={`header__address-book ${isAddressBook ? 'active-tab' : ''}`}
        onClick={() => navigate('/main')}
      >
        Address Book
      </button>
      {isAdmin && (
        <button
          className={`header__settings-btn ${isSettings ? 'active-tab' : ''}`}
          onClick={() => {
            if (loggedInUser?.role === 'Admin') navigate('/roles');
          }}
        >
          Settings
        </button>
      )}
    </div>
  );
}
