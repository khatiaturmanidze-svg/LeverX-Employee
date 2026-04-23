import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSetNewPasswordMutation } from '../features/authApi';
import { getErrorMessage } from '@shared/lib';
import { SignHeader, SignMain, BtnSubmit } from '@shared/ui';

function getStoredEmail(): string {
  return (
    localStorage.getItem('loggedInUser') ??
    sessionStorage.getItem('loggedInUser') ??
    ''
  );
}

function updateStoredResult(): void {
  const storage = localStorage.getItem('result')
    ? localStorage
    : sessionStorage;
  const storedResult = storage.getItem('result');

  if (!storedResult) {
    return;
  }

  try {
    const parsed = JSON.parse(storedResult) as { mustChangePassword?: boolean };
    storage.setItem(
      'result',
      JSON.stringify({
        ...parsed,
        mustChangePassword: false,
      }),
    );
  } catch {
    // Ignore malformed stored auth payload and continue.
  }
}

export default function NewPassword(): React.ReactElement {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [setNewPasswordRequest, { isLoading }] = useSetNewPasswordMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = getStoredEmail();

    if (!email) {
      navigate('/signin', { replace: true });
      return;
    }

    try {
      const result = await setNewPasswordRequest({
        email,
        newPassword,
      }).unwrap();

      updateStoredResult();
      setSuccessMessage(result.message);
      setErrorMessage(null);
      navigate('/main', { replace: true });
    } catch (error) {
      setSuccessMessage(null);
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <>
      <SignHeader />
      <SignMain>
        <form className="signin__form" onSubmit={handleSubmit}>
          <h2>Set a new password</h2>
          <p className="sign__label">
            Your temporary password must be replaced before continuing.
          </p>
          <input
            type="password"
            placeholder="Enter new password"
            className="user-input signin__form-password"
            name="newPassword"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          {errorMessage && <p className="signin__error">{errorMessage}</p>}
          {successMessage && <p className="sign__label">{successMessage}</p>}

          <BtnSubmit className="signin__btn search__btn-submit">
            {isLoading ? 'Saving...' : 'Set new password'}
          </BtnSubmit>
        </form>
      </SignMain>
    </>
  );
}
