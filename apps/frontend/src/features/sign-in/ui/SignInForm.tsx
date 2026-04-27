import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignInMutation } from '../../authApi';
import { getErrorMessage } from '@shared/lib';
import { BtnSubmit } from '@/shared/ui';

export default function SignInForm(): React.ReactElement {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [signIn, { isLoading }] = useSignInMutation();

  const handleSumbit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    try {
      const result = await signIn({ email: trimmedEmail, password }).unwrap();

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('loggedInUser', trimmedEmail);
      storage.setItem('result', JSON.stringify(result));
      navigate(result.mustChangePassword ? '/new-password' : '/main', {
        replace: true,
      });
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <form className="signin__form" onSubmit={handleSumbit}>
      <div className="sign__form-copy">
        <p className="sign__form-kicker">Welcome back</p>
        <h2 className="sign__form-title">Sign in to your workspace</h2>
        <p className="sign__form-text">
          Pick up where you left off and keep your employee operations moving.
        </p>
      </div>

      <label className="sign__field">
        <span className="sign__field-label">Work email</span>
        <input
          type="email"
          name="user"
          placeholder="Enter Email"
          className="user-input signin__form-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className="sign__field">
        <span className="sign__field-label">Password</span>
        <input
          type="password"
          placeholder="Enter password"
          className="user-input signin__form-password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <div className="flex--horizontal sign__form-row">
        <input
          type="checkbox"
          id="signin__remember-me"
          className="sign__checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="signin__remember-me" className="sign__label">
          Remember Me
        </label>
      </div>

      {errorMessage && <p className="signin__error">{errorMessage}</p>}
      <BtnSubmit
        isLoading={isLoading}
        message="Signing in..."
        className="signin__btn search__btn-submit"
      >
        Sign In
      </BtnSubmit>
    </form>
  );
}
