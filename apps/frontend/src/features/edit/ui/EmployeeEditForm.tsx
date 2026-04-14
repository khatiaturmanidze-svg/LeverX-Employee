import React, { useReducer } from 'react';
import { IEmployee, EmployeeUpdate, IVisa } from '../../../types/type';
import { DetailRow } from './DetailRow';
import VisaEditorList from './VisaEditorList';
import { getInitialState, validateEmployeeForm } from '../lib/helpers';
import { EmployeeFormState } from '../model/state.types';
import {
  editReducer,
  setField,
  setVisa,
  submitError,
  submitStart,
  submitSuccess,
} from '../model/state';

interface EmployeEditFormProps {
  user: IEmployee;
  onCancel: () => void;
  onSaveSuccess: (updatedUser: EmployeeUpdate) => void;
}

export function EmployeeEditForm({
  user,
  onCancel,
  onSaveSuccess,
}: EmployeEditFormProps) {
  const [state, dispatch] = useReducer(editReducer, user, getInitialState);
  const { formData, isSubmitting, errors } = state;

  const handleInputChange = (
    fieldName: keyof EmployeeFormState,
    newValue: string,
  ) => dispatch(setField(fieldName, newValue));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(submitStart());

    const validationErrors = validateEmployeeForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      dispatch(submitError(validationErrors));
      return;
    }

    dispatch(submitSuccess());

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

  const handleVisaChange = (
    index: number,
    field: keyof IVisa,
    value: string,
  ) => {
    dispatch(setVisa(index, field, value));
  };

  const renderEditableRow = (
    icon: string,
    label: string,
    fieldName: keyof EmployeeFormState,
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

      <VisaEditorList visas={formData.visas} onVisaChange={handleVisaChange} />

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
