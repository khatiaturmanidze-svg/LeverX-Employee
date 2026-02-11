import React from 'react';
import { IEmployee } from '../types/type';
import { useNavigate, useLocation } from 'react-router-dom';
interface HeaderProps {
  loggedInUser: IEmployee | null;
  isAdmin?: boolean;
}

export function Header({
  loggedInUser,
  isAdmin,
}: HeaderProps): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  const isAddressBook = location.pathname.startsWith('/main');
  const isSettings = location.pathname.startsWith('/roles');

  const handleOpenRoles = () => {
    if (loggedInUser?.role === 'Admin') navigate('/roles');
  };

  const handleLogOff = () => {
    navigate('/');
    localStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('loggedInUser');
  };

  const handleGoMain = () => {
    navigate('/main');
  };

  const handleHeaderUser = () => {
    if (loggedInUser) navigate(`/details/${loggedInUser._id}`);
  };
  return (
    <header className="header flex--horizontal">
      <button className="header__brand" onClick={handleGoMain}>
        <h3 className="header__brand-secondary">leverx</h3>
        <h2 className="heading__brand-main">employee services</h2>
      </button>
      <div className="tab-container">
        <button
          className={`header__address-book ${
            isAddressBook ? 'active-tab' : ''
          }`}
          onClick={handleGoMain}
        >
          Address Book
        </button>
        {isAdmin && (
          <button
            className={`header__settings-btn ${isSettings ? 'active-tab' : ''}`}
            onClick={handleOpenRoles}
          >
            Settings
          </button>
        )}
      </div>
      <div className="header--right flex--horizontal">
        <button className="header__support-btn flex--horizontal">
          <img
            src="/svgs/support-icon.svg"
            alt="support icon"
            className="header__support-icon"
          />
          <p className="header__support-paragraph">support</p>
        </button>
        <div className="header__user" onClick={handleHeaderUser}>
          {loggedInUser ? (
            <button
              className="flex--horizontal header__logged-in"
              data-id={loggedInUser._id}
            >
              <img
                src={loggedInUser.user_avatar}
                alt="employee"
                className="header__employee-img"
              />

              <p className="header__employee">
                {loggedInUser.first_name} {loggedInUser.last_name}
              </p>
            </button>
          ) : (
            <p className="header__employee">Not Logged In</p>
          )}
        </div>
        <button className="header__logoff-wrap flex--horizontal">
          <img
            src="/svgs/log-off-icon.svg"
            alt="log off icon"
            className="header__logoff-btn"
            onClick={handleLogOff}
          />
        </button>
      </div>
    </header>
  );
}
