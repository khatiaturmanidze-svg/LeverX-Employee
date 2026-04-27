import React from 'react';

interface BtnSubmitProps {
  className?: string;
  handleSubmit?: () => void;
  isLoading?: boolean;
  message?: string;
  children: React.ReactNode;
}

export default function BtnSubmit({
  className = '',
  handleSubmit,
  isLoading = false,
  children,
  message = 'Loading...',
}: BtnSubmitProps): React.ReactElement {
  return (
    <button
      type="submit"
      className={`${className}`.trim()}
      onClick={handleSubmit}
      disabled={isLoading}
    >
      {isLoading ? message : children}
    </button>
  );
}
