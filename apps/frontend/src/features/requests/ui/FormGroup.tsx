import React from 'react';
type FormGroupProps = {
  label: string;
  children: React.ReactNode;
};

export const FormGroup = ({ label, children }: FormGroupProps) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  );
};
