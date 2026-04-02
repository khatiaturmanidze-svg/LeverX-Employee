import React from 'react';

export default function BtnSupport(): React.ReactElement {
  return (
    <button className="header__support-btn flex--horizontal">
      <img
        src="/svgs/support-icon.svg"
        alt="support icon"
        className="header__support-icon"
      />
      <p className="header__support-paragraph">support</p>
    </button>
  );
}
