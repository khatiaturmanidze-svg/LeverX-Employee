import React from 'react';
import SignHeader from '../components/Sign/SignHeader';
import SignInForm from '../components/Sign/SignInForm';
import SignMain from '../components/Sign/SignMain';

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
