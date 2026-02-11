import React from 'react';

interface DetailRowProps {
  icon: string;
  label: string;
  value?: string;
  isEditing: boolean;
  fieldName: string;
  onValueChange?: (fieldName: string, newValue: string) => void;
}

export function DetailRow({
  icon,
  label,
  value,
  isEditing,
  fieldName,
  onValueChange,
}: DetailRowProps) {
  if (!isEditing) {
    return (
      <div className="details-section__row">
        <div className="flex--horizontal">
          <img
            src={`/svgs/${icon}.svg`}
            className="details-section-icon"
            alt={`${label} icon`}
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
        <img
          src={`/svgs/${icon}.svg`}
          className="details-section-icon"
          alt={`${label} icon`}
        />
        <label htmlFor={fieldName}>{label}</label>
      </div>
      <input
        type="text"
        id={fieldName}
        name={fieldName}
        className="edit-input"
        defaultValue={value}
        onChange={(e) => onValueChange?.(fieldName, e.target.value)}
      />
    </div>
  );
}
