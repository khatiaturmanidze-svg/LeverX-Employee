import React from 'react';
import { useFormStatus } from 'react-dom';

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
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`${className}`.trim()}
      onClick={handleSubmit}
      disabled={pending}
    >
      {pending ? 'Saving...' : children}
    </button>
  );
}
