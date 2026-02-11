import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SignHeader(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const isSignUpPage = location.pathname === '/signup';

  return (
    <header className="header-sign">
      <button className="header__brand">
        <h3 className="heade__brand-secondary">leverX</h3>
        <h2 className="header__brand-main">employee services</h2>
      </button>
      {!isSignUpPage && (
        <button
          className="header__btn-signup"
          onClick={() => navigate('/signup')}
        >
          <p className="sign--up">Sign Up</p>
        </button>
      )}

      {isSignUpPage && (
        <button
          className="header__btn-signin"
          onClick={() => navigate('/signin')}
        >
          <p className="header__btn-text">Sign In</p>
        </button>
      )}
    </header>
  );
}
