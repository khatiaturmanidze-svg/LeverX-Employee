import React from 'react';
import { IEmployee } from '../../types/type';
import Logo from './Logo';
import BtnLogOff from './btnLogOff';
import BtnSupport from './BtnSupport';
import LoggedInUser from './LoggedInUser';
import HeaderTabs from './HeaderTabs';
interface HeaderProps {
  loggedInUser: IEmployee | null;
  isAdmin?: boolean;
}

export function Header({
  loggedInUser,
  isAdmin,
}: HeaderProps): React.ReactElement {
  return (
    <header className="header flex--horizontal">
      <Logo />
      <HeaderTabs isAdmin={isAdmin} loggedInUser={loggedInUser} />
      <div className="header--right flex--horizontal">
        <BtnSupport />
        <LoggedInUser loggedInUser={loggedInUser} />
        <BtnLogOff />
      </div>
    </header>
  );
}
