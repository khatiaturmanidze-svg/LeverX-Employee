import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth } from '../lib/authStorage';

interface BtnLogOffProps {
  className?: string;
}

export default function btnLogOff({
  className = '',
}: BtnLogOffProps): React.ReactElement {
  const navigate = useNavigate();
  const handleLogOff = () => {
    getStoredAuth()?.storage.removeItem('loggedInUser');
    navigate('/');
  };

  return (
    <button
      className={`header__logoff-wrap flex--horizontal ${className}`.trim()}
      onClick={handleLogOff}
    >
      <img
        src="/svgs/log-off-icon.svg"
        alt="log off icon"
        className="header__logoff-btn"
      />
    </button>
  );
}
