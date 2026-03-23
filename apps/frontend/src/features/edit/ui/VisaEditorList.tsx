import React from 'react';
import { IVisa } from '../../../types/type';
import { DetailRow } from './DetailRow';

interface VisaEditorListProps {
  visas: IVisa[];
  onVisaChange: (index: number, field: keyof IVisa, value: string) => void;
}

export default function VisaEditorList({
  visas,
  onVisaChange,
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
          <DetailRow
            icon="globe-icon"
            label="Type"
            value={visa.type}
            isEditing={true}
            fieldName="type"
            onValueChange={(_, value) => onVisaChange(index, 'type', value)}
          />
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
          <DetailRow
            icon="calendar-icon"
            label="End Date"
            value={visa.end_date}
            isEditing={true}
            fieldName="end_date"
            onValueChange={(_, value) => onVisaChange(index, 'end_date', value)}
          />
        </div>
      ))}
    </>
  );
}
