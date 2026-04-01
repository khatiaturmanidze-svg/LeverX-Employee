import React from 'react';
import { IEmployee } from '../../types/type';
import Logo from './Logo';
import BtnLogOff from './BtnLogOff';
import BtnSupport from './BtnSupport';
import LoggedInUser from './LoggedInUser';
import HeaderTabs from './HeaderTabs';
import { HeaderMenu } from './HeaderMenu';
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
      <HeaderMenu loggedInUser={loggedInUser} isAdmin={isAdmin} />
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
