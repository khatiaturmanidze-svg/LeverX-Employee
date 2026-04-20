import React from 'react';

type InputFieldProps = {
  id?: string;
  name?: string;
  type: string;
  value?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

export const InputField = ({
  id,
  name,
  type,
  value,
  placeholder,
  autoComplete,
  required = false,
  onChange,
  error,
}: InputFieldProps): React.ReactElement => {
  return (
    <>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        onChange={onChange}
        className="edit-input"
      />
      {error && <p className="form-error">{error}</p>}
    </>
  );
};
