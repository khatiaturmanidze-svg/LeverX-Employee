import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSetNewPasswordMutation } from '../features/authApi';
import { getErrorMessage } from '@shared/lib';
import { SignHeader, SignMain, BtnSubmit } from '@shared/ui';
import { AUTH_DATA_KEY, getStoredAuth } from '@shared/lib/authStorage';

export default function NewPassword(): React.ReactElement {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [setNewPasswordRequest, { isLoading }] = useSetNewPasswordMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const auth = getStoredAuth();
      if (!auth) {
        navigate('/signin', { replace: true });
        return;
      }
      if (auth.error) throw auth.error;

      const result = await setNewPasswordRequest({
        email: auth.email,
        newPassword,
      }).unwrap();

      if (auth.authData) {
        auth.storage.setItem(
          AUTH_DATA_KEY,
          JSON.stringify({ ...auth.authData, mustChangePassword: false }),
        );
      }
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

          <BtnSubmit
            isLoading={isLoading}
            message="Saving..."
            className="signin__btn search__btn-submit"
          >
            Set new password
          </BtnSubmit>
        </form>
      </SignMain>
    </>
  );
}
