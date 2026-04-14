import React from 'react';
import { SignHeader, SignMain } from '@shared/ui';
import { SignUpForm } from '@features/sign-up';

export default function SignUp(): React.ReactElement {
  return (
    <>
      <SignHeader />
      <SignMain>
        <SignUpForm />
      </SignMain>
    </>
  );
}
