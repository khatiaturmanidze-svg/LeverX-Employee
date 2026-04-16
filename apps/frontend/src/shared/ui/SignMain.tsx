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
        <div className="sign__eyebrow">Employee workspace</div>
        <h1 className="sign__welcome">
          Everything your team needs,
          <span className="sign__welcome-accent"> in one calm place.</span>
        </h1>
        <p className="sign__paragraph">
          Manage people, requests, and day-to-day employee operations with a
          cleaner workflow from the moment you sign in.
        </p>
        <div className="sign__highlights">
          <div className="sign__highlight-card">
            <span className="sign__highlight-value">Fast</span>
            <span className="sign__highlight-label">employee search</span>
          </div>
          <div className="sign__highlight-card">
            <span className="sign__highlight-value">Clear</span>
            <span className="sign__highlight-label">request tracking</span>
          </div>
          <div className="sign__highlight-card">
            <span className="sign__highlight-value">Easy</span>
            <span className="sign__highlight-label">account access</span>
          </div>
        </div>
      </div>
      <div className="sign__form-container">{children}</div>
    </main>
  );
}
