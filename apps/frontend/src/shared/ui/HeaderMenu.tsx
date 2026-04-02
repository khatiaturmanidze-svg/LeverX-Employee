import React, { useState } from 'react';
import HeaderTabs from './HeaderTabs';
import { IEmployee } from '../../types/type';
import { BtnLogOff, BtnSupport, LoggedInUser } from '.';

interface HeaderMenuProps {
  loggedInUser: IEmployee | null;
  isAdmin?: boolean;
}

export function HeaderMenu({
  loggedInUser,
  isAdmin,
}: HeaderMenuProps): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  return (
    <>
      <button
        type="button"
        className={`header--mobile-overlay ${
          isMenuOpen ? 'header--mobile-overlay-open' : ''
        }`}
        aria-label="close menu overlay"
        onClick={handleMenuClick}
      />
      <img
        src="/svgs/menu-icon.svg"
        alt={isMenuOpen ? 'close menu' : 'open menu'}
        className="header--menu-btn"
        onClick={handleMenuClick}
      />
      <aside
        className={`header--mobile-menu ${
          isMenuOpen ? 'header--mobile-menu-open' : ''
        }`}
      >
        <HeaderTabs
          loggedInUser={loggedInUser}
          isAdmin={isAdmin}
          containerClassName="tab-container header__mobile-tabs"
        />

        <div className="header--mobile-menu-footer">
          <LoggedInUser loggedInUser={loggedInUser} />
          <BtnSupport />
          <BtnLogOff />
        </div>
      </aside>
    </>
  );
}
