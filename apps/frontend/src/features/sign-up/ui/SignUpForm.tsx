import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignUpMutation } from '../../authApi';
import { getErrorMessage } from '@shared/lib';

export default function SignUpForm(): React.ReactElement {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, seterrorMessage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [signUp] = useSignUpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    try {
      const result = await signUp({
        email: trimmedEmail,
        password,
        first_name: firstName,
        last_name: lastName,
      }).unwrap();
      const storage = rememberMe ? localStorage : sessionStorage;
      const employee = result.employee;
      storage.setItem('loggedInUser', trimmedEmail);
      storage.setItem('result', JSON.stringify(employee));

      navigate('/main', { replace: true });
    } catch (err) {
      seterrorMessage(getErrorMessage(err));
    }
  };

  return (
    <form className="signup__form" onSubmit={handleSubmit}>
      <div className="sign__form-copy">
        <p className="sign__form-kicker">Create your account</p>
        <h2 className="sign__form-title">Join the LeverX workspace</h2>
        <p className="sign__form-text">
          Set up your profile once and keep employee services close at hand.
        </p>
      </div>

      <div className="sign__grid">
        <label className="sign__field">
          <span className="sign__field-label">First name</span>
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            className="signup__form-first user-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>

        <label className="sign__field">
          <span className="sign__field-label">Last name</span>
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            className="signup__form-last user-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="sign__field">
        <span className="sign__field-label">Work email</span>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="signup__form-email user-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="sign__field">
        <span className="sign__field-label">Password</span>
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="signup__form-password user-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <div className="flex--horizontal sign__form-row">
        <input
          type="checkbox"
          id="signup__remember-me"
          className="sign__checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="signup__remember-me" className="sign__label">
          Remember Me
        </label>
      </div>
      {errorMessage && <p className="signup__form-error">{errorMessage}</p>}

      <button type="submit" className="search__btn-submit signup__btn">
        Sign Up
      </button>
    </form>
  );
}
