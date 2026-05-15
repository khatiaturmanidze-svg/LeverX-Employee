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
      <button
        type="button"
        className="header--menu-btn"
        aria-label={isMenuOpen ? 'close menu' : 'open menu'}
        aria-expanded={isMenuOpen}
        aria-controls="header-mobile-menu"
        onClick={handleMenuClick}
      >
        <img src="/svgs/menu-icon.svg" alt="" aria-hidden="true" />
      </button>
      <aside
        id="header-mobile-menu"
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
