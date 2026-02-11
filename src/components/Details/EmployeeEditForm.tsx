import React, { useState } from 'react';
import { IEmployee, EmployeeUpdate, IVisa } from '../../types/type';
import { DetailRow } from './DetailRow';
// import { formatDateOfBirth } from "../../core.tsx";

interface EmployeEditFormProps {
  user: IEmployee;
  onCancel: () => void;
  onSaveSuccess: (updatedUser: EmployeeUpdate) => void;
}

const validateForm = (formData: FormState) => {
  const errors: Record<string, string> = {};

  if (!formData.department) errors.department = 'Department is required';
  if (!formData.email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
  if (formData.desk_number && isNaN(Number(formData.desk_number)))
    errors.desk_number = 'Desk number must be a number';

  // date_birth
  if (formData.date_birth) {
    const [y, m, d] = formData.date_birth.split('-').map(Number);
    if (!y || y < 1900 || !m || m < 1 || m > 12 || !d || d < 1 || d > 31)
      errors.date_birth = 'input format should be year-month-day';
  }

  // visas
  formData.visas.forEach((v, idx) => {
    if (!v.issuing_country) errors[`visa_${idx}_country`] = 'Required';
    if (!v.type) errors[`visa_${idx}_type`] = 'Required';
  });

  return errors;
};

const getFormState = (user: IEmployee) => ({
  department: user.department,
  building: user.building,
  room: user.room,
  desk_number: user.desk_number?.toString() || '',
  phone: user.phone,
  email: user.email,
  zoom_id: user.zoom_id,
  zoom_link: user.zoom_link,
  citizenship: user.citizenship,

  first_native_name: user.first_native_name || '',
  last_native_name: user.last_native_name || '',
  date_birth: user.date_birth
    ? `${user.date_birth.year}-${String(user.date_birth.month).padStart(
        2,
        '0'
      )}-${String(user.date_birth.day).padStart(2, '0')}`
    : '',
  manager_id: user.manager?._id || '',

  visas:
    user.visa?.map((v) => ({
      issuing_country: v.issuing_country,
      type: v.type,
      start_date: v.start_date
        ? new Date(v.start_date).toISOString().slice(0, 10)
        : '',
      end_date: v.end_date
        ? new Date(v.end_date).toISOString().slice(0, 10)
        : '',
    })) || [],
});

type FormState = ReturnType<typeof getFormState> & {
  visas: IVisa[];
};

export function EmployeeEditForm({
  user,
  onCancel,
  onSaveSuccess,
}: EmployeEditFormProps) {
  const [formData, setFormData] = useState<FormState>(getFormState(user));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldName: keyof FormState, newValue: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false);
      setErrors(errors);
      return;
    }

    setErrors({});

    const [year, month, day] = formData.date_birth
      ? formData.date_birth.split('-').map(Number)
      : [];

    const updatePayload: EmployeeUpdate = {
      department: formData.department,
      building: formData.building,
      room: formData.room,
      desk_number: formData.desk_number ? Number(formData.desk_number) : null,
      phone: formData.phone,
      email: formData.email,
      zoom_id: formData.zoom_id,
      zoom_link: formData.zoom_link,
      citizenship: formData.citizenship,

      first_native_name: formData.first_native_name,
      last_native_name: formData.last_native_name,

      date_birth: formData.date_birth ? { year, month, day } : undefined,

      manager: formData.manager_id || undefined,
    };
    onSaveSuccess(updatePayload);
  };

  const renderVisaRows = () => {
    return formData.visas.map((visa, index) => (
      <div key={index} className="visa-row">
        <DetailRow
          icon="globe-icon"
          label="Issuing Country"
          value={visa.issuing_country}
          isEditing={true}
          fieldName="issuing_country"
          onValueChange={(field, value) =>
            handleVisaChange(index, 'issuing_country', value)
          }
        />
        <DetailRow
          icon="globe-icon"
          label="Type"
          value={visa.type}
          isEditing={true}
          fieldName="type"
          onValueChange={(field, value) =>
            handleVisaChange(index, 'type', value)
          }
        />
        <DetailRow
          icon="calendar-icon"
          label="Start Date"
          value={visa.start_date}
          isEditing={true}
          fieldName="start_date"
          onValueChange={(field, value) =>
            handleVisaChange(index, 'start_date', value)
          }
        />
        <DetailRow
          icon="calendar-icon"
          label="End Date"
          value={visa.end_date}
          isEditing={true}
          fieldName="end_date"
          onValueChange={(field, value) =>
            handleVisaChange(index, 'end_date', value)
          }
        />
      </div>
    ));
  };

  const handleVisaChange = (
    index: number,
    field: keyof (typeof formData.visas)[0],
    value: string
  ) => {
    setFormData((prev) => {
      const visas = [...(prev.visas || [])];
      visas[index] = { ...(visas[index] || {}), [field]: value };
      return { ...prev, visas };
    });
  };

  const renderEditableRow = (
    icon: string,
    label: string,
    fieldName: keyof FormState
  ) => {
    const displayValue = String(formData[fieldName] || '');

    return (
      <DetailRow
        icon={icon}
        label={label}
        value={displayValue}
        isEditing={true}
        fieldName={fieldName}
        onValueChange={
          handleInputChange as (fieldName: string, newValue: string) => void
        }
      />
    );
  };

  return (
    <form className="employee-edit-form" onSubmit={handleSubmit}>
      <h2 className="details-section__general">General Info</h2>
      {renderEditableRow('briefcase-icon', 'Department', 'department')}
      {errors.department && <p className="form-error">{errors.department}</p>}
      {renderEditableRow('building-icon', 'Building', 'building')}
      {errors.building && <p className="form-error">{errors.building}</p>}

      {renderEditableRow('door-icon', 'Room', 'room')}
      {errors.room && <p className="form-error">{errors.room}</p>}

      {renderEditableRow('hashtag-icon', 'Desk Number', 'desk_number')}
      {errors.desk_number && <p className="form-error">{errors.desk_number}</p>}

      {renderEditableRow('user-icon', 'First Native Name', 'first_native_name')}
      {errors.first_native_name && (
        <p className="form-error">{errors.first_native_name}</p>
      )}

      {renderEditableRow('user-icon', 'Last Native Name', 'last_native_name')}
      {errors.last_native_name && (
        <p className="form-error">{errors.last_native_name}</p>
      )}

      {renderEditableRow('calendar-icon', 'Date of Birth', 'date_birth')}
      {errors.date_birth && <p className="form-error">{errors.date_birth}</p>}

      <h2 className="details-section__general">Contacts</h2>
      {renderEditableRow('mobile-icon', 'Phone', 'phone')}
      {errors.phone && <p className="form-error">{errors.phone}</p>}

      {renderEditableRow('at-icon', 'Email', 'email')}
      {errors.email && <p className="form-error">{errors.email}</p>}

      {renderEditableRow('zoom-icon', 'Zoom ID', 'zoom_id')}
      {errors.zoom_id && <p className="form-error">{errors.zoom_id}</p>}

      {renderEditableRow('zoom-icon', 'Zoom Link', 'zoom_link')}
      {errors.zoom_link && <p className="form-error">{errors.zoom_link}</p>}

      <h2 className="details-section__general">Travel Info</h2>
      {renderEditableRow('globe-icon', 'Citizenship', 'citizenship')}
      {errors.citizenship && <p className="form-error">{errors.citizenship}</p>}

      {renderVisaRows()}

      <div className="details-section__btns">
        <button
          type="submit"
          className="details-section__row-save"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          className="details-section__row-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Canceling...' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
