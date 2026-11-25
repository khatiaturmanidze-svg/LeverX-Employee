import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignOutMutation } from '../../features/authApi';
import { getErrorMessage } from '../lib/core';

interface BtnLogOffProps {
  className?: string;
}

export default function BtnLogOff({
  className = '',
}: BtnLogOffProps): React.ReactElement {
  const navigate = useNavigate();
  const [signOut, { isLoading }] = useSignOutMutation();
  const [error, setError] = useState<string | null>(null);
  const handleLogOff = async () => {
    try {
      await signOut().unwrap();
      navigate('/signin', { replace: true });
    } catch (failure) {
      setError(getErrorMessage(failure));
    }
  };

  return (
    <>
      <button
        aria-label="Sign out"
        disabled={isLoading}
        className={`header__logoff-wrap flex--horizontal ${className}`.trim()}
        onClick={handleLogOff}
      >
        <img
          src="/svgs/log-off-icon.svg"
          alt="log off icon"
          className="header__logoff-btn"
        />
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
