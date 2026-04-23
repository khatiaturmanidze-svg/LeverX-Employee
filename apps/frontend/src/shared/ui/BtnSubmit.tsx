import React from 'react';

interface BtnSubmitProps {
  className?: string;
  handleSubmit?: () => void;
  children: React.ReactNode;
}

export default function BtnSubmit({
  className = '',
  handleSubmit,
  children,
}: BtnSubmitProps): React.ReactElement {
  return (
    <button
      type="submit"
      className={`${className}`.trim()}
      onClick={handleSubmit}
    >
      {children}
    </button>
  );
}
