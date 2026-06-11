import React from 'react';
import { Icon } from '@shared/ui';

interface DetailRowProps<FieldName extends string = string> {
  icon: string;
  label: string;
  value?: string;
  isEditing: boolean;
  fieldName: FieldName;
  onValueChange?: (fieldName: FieldName, newValue: string) => void;
}

export function DetailRow<FieldName extends string = string>({
  icon,
  label,
  value,
  isEditing,
  fieldName,
  onValueChange,
}: DetailRowProps<FieldName>) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onValueChange?.(fieldName, event.target.value);
  };

  if (!isEditing) {
    return (
      <div className="details-section__row">
        <div className="flex--horizontal">
          <Icon
            src={`/svgs/${icon}.svg`}
            className="details-section-icon"
            alt={`${label} icon`}
            width={16}
            height={16}
          />
          <p>{label}:</p>
        </div>
        <div className="details-section__value">{value}</div>
      </div>
    );
  }
  return (
    <div className="details-section__row details-section__row--edit">
      <div className="flex--horizontal">
        <Icon
          src={`/svgs/${icon}.svg`}
          className="details-section-icon"
          alt={`${label} icon`}
          width={16}
          height={16}
        />
        <label htmlFor={fieldName}>{label}</label>
      </div>
      <input
        type="text"
        id={fieldName}
        name={fieldName}
        className="edit-input"
        defaultValue={value}
        onChange={handleChange}
      />
    </div>
  );
}
