import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function btnLogOff() {
  const navigate = useNavigate();
  const handleLogOff = () => {
    if (localStorage.getItem('loggedInUser')) {
      localStorage.removeItem('loggedInUser');
    } else if (sessionStorage.getItem('loggedInUser')) {
      sessionStorage.removeItem('loggedInUser');
    }
    navigate('/');
  };

  return (
    <button className="header__logoff-wrap flex--horizontal">
      <img
        src="/svgs/log-off-icon.svg"
        alt="log off icon"
        className="header__logoff-btn"
        onClick={handleLogOff}
      />
    </button>
  );
}
