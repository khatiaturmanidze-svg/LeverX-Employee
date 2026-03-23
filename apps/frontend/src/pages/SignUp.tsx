import React from 'react';
import SignHeader from '../shared/ui/SignHeader';
import SignUpForm from '../features/sign-up/SignUpForm';
import SignMain from '../shared/ui/SignMain';

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
