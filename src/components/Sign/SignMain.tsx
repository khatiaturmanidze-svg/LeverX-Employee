import React from 'react';

interface SignMainProps {
  children: React.ReactNode; // the form (SignInForm / SignUpForm)
}

export default function SignMain({
  children,
}: SignMainProps): React.ReactElement {
  return (
    <main className="sign">
      <div className="sign__message">
        <h1 className="sign__welcome">
          <span className="highlight">Welcome</span>
        </h1>
        <p className="sign__paragraph">
          To <span className="highlight">LeverX</span> Employee Services
        </p>
      </div>
      <div className="sign__form-container">{children}</div>
    </main>
  );
}
