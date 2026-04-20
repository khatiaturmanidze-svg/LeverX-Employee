import React from 'react';
import Icon from './Icon';

type FormGroupProps = {
  label: string;
  htmlFor?: string;
  icon?: string;
  className?: string;
  children: React.ReactNode;
};

export const FormGroup = ({
  label,
  htmlFor,
  icon,
  children,
  className,
}: FormGroupProps): React.ReactElement => {
  return (
    <div className={`${className ? className : 'form-group'}`}>
      <label htmlFor={htmlFor}>
        {icon && (
          <span className="flex--horizontal">
            <Icon
              src={`/svgs/${icon}.svg`}
              className="details-section-icon"
              alt={`${label} icon`}
              width={16}
              height={16}
            />
            <span>{label}</span>
          </span>
        )}
        {!icon && label}
      </label>
      {children}
    </div>
  );
};
