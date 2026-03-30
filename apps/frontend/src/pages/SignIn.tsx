import React from 'react';
import { SignHeader, SignMain } from '@shared/ui';
import { SignInForm } from '@features/sign-in';

export default function SignIn(): React.ReactElement {
  return (
    <>
      <SignHeader />
      <SignMain>
        <SignInForm />
      </SignMain>
    </>
  );
}
