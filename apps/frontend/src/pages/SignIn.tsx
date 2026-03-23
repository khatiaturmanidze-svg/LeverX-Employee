import React from 'react';
import SignHeader from '../shared/ui/SignHeader';
import SignInForm from '../features/sign-in/SignInForm';
import SignMain from '../shared/ui/SignMain';

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
