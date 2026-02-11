import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignInMutation } from '../../features/authApi';
import { getErrorMessage } from '../../core';

export default function SignInForm(): React.ReactElement {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [signIn] = useSignInMutation();

  const handleSumbit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    try {
      const result = await signIn({ email: trimmedEmail, password }).unwrap();

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('loggedInUser', trimmedEmail);
      storage.setItem('result', JSON.stringify(result));
      navigate('/main', { replace: true });
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <form className="signin__form" onSubmit={handleSumbit}>
      <input
        type="email"
        name="user"
        placeholder="Enter Email"
        className="user-input signin__form-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter password"
        className="user-input signin__form-password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex--horizontal">
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
      <button type="submit" className="signin__btn search__btn-submit">
        Sign In
      </button>
    </form>
  );
}
