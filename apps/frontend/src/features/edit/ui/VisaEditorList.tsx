import React from 'react';
import { CreateVisaInput } from '../../../types/type';
import { DetailRow } from './DetailRow';

interface VisaEditorListProps {
  visas: CreateVisaInput[];
  onVisaChange: (
    index: number,
    field: keyof CreateVisaInput,
    value: string,
  ) => void;
  errors?: Record<string, string>;
}

export default function VisaEditorList({
  visas,
  onVisaChange,
  errors = {},
}: VisaEditorListProps) {
  if (!visas || visas.length === 0) {
    return null;
  }

  return (
    <>
      {visas.map((visa, index) => (
        <div key={index} className="visa-row">
          <DetailRow
            icon="globe-icon"
            label="Issuing Country"
            value={visa.issuing_country}
            isEditing={true}
            fieldName="issuing_country"
            onValueChange={(_, value) =>
              onVisaChange(index, 'issuing_country', value)
            }
          />
          {errors[`visa_${index}_country`] && (
            <p className="form-error">{errors[`visa_${index}_country`]}</p>
          )}
          <DetailRow
            icon="globe-icon"
            label="Type"
            value={visa.type}
            isEditing={true}
            fieldName="type"
            onValueChange={(_, value) => onVisaChange(index, 'type', value)}
          />
          {errors[`visa_${index}_type`] && (
            <p className="form-error">{errors[`visa_${index}_type`]}</p>
          )}
          <DetailRow
            icon="calendar-icon"
            label="Start Date"
            value={visa.start_date}
            isEditing={true}
            fieldName="start_date"
            onValueChange={(_, value) =>
              onVisaChange(index, 'start_date', value)
            }
          />
          {errors[`visa_${index}_start_date`] && (
            <p className="form-error">{errors[`visa_${index}_start_date`]}</p>
          )}
          <DetailRow
            icon="calendar-icon"
            label="End Date"
            value={visa.end_date}
            isEditing={true}
            fieldName="end_date"
            onValueChange={(_, value) => onVisaChange(index, 'end_date', value)}
          />
          {errors[`visa_${index}_end_date`] && (
            <p className="form-error">{errors[`visa_${index}_end_date`]}</p>
          )}
        </div>
      ))}
    </>
  );
}
