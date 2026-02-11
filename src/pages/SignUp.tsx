import React from 'react';
import SignHeader from '../components/Sign/SignHeader';
import SignUpForm from '../components/Sign/SignUpForm';
import SignMain from '../components/Sign/SignMain';

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
