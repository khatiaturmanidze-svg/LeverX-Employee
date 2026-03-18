import React from 'react';

type InputFieldField = {
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

export const InputField = ({ type, onChange, error }: InputFieldField) => {
  return (
    <>
      <input type={type} onChange={onChange} />
      {error && <p className="form-error">{error}</p>}
    </>
  );
};
