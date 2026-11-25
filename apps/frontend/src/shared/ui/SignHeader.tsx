import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@shared/ui';
import BtnLogOff from './BtnLogOff';
import { SignupPolicy } from '../lib/SignupPolicy';
export default function SignHeader(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const allowSignup = useContext(SignupPolicy);

  const isSignUpPage = location.pathname === '/signup';
  const isNewPasswordPage = location.pathname === '/new-password';

  return (
    <header className="header-sign">
      <div className="header-sign__brand">
        <Logo />
        <p className="header-sign__tagline">People operations, simplified</p>
      </div>
      {allowSignup && !isSignUpPage && !isNewPasswordPage && (
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
      {isNewPasswordPage && <BtnLogOff />}
    </header>
  );
}
