import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function btnLogOff() {
  const navigate = useNavigate();
  return (
    <button className="header__logoff-wrap flex--horizontal">
      <img
        src="/svgs/log-off-icon.svg"
        alt="log off icon"
        className="header__logoff-btn"
        onClick={() => {
          navigate('/');
          localStorage.removeItem('loggedInUser');
          sessionStorage.removeItem('loggedInUser');
        }}
      />
    </button>
  );
}
