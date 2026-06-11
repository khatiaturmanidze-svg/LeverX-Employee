import React, { useActionState, useReducer } from 'react';
import { IEmployee, IVisa } from '@/types/type';
import { DetailRow } from './DetailRow';
import VisaEditorList from './VisaEditorList';
import { getInitialState, submitEditUser } from '../lib/helpers';
import { EmployeeFormState, SubmitState } from '../model/state.types';
import { editReducer, setField, setVisa } from '../model/state';
import { useUpdateEmployeeMutation } from '@/features/usersApi';
import { BtnSubmit } from '@/shared/ui';
import { initialSubmitState } from '@/shared/lib';

interface EmployeEditFormProps {
  user: IEmployee;
  onCancel: () => void;
}

export function EmployeeEditForm({ user, onCancel }: EmployeEditFormProps) {
  const [state, dispatch] = useReducer(editReducer, user, getInitialState);
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();
  const { formData } = state;

  const handleInputChange = (
    fieldName: keyof EmployeeFormState,
    newValue: string,
  ) => dispatch(setField(fieldName, newValue));

  const [submitState, submitAction, isPending] = useActionState<
    SubmitState,
    FormData
  >(async () => {
    const result = await submitEditUser(formData, user._id, updateEmployee);

    if (result.statusType === 'success') {
      onCancel();
    }

    return result;
  }, initialSubmitState);

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
        onValueChange={handleInputChange}
      />
    );
  };

  return (
    <form className="employee-edit-form" action={submitAction}>
      <h2 className="details-section__general">General Info</h2>
      {renderEditableRow('briefcase-icon', 'Department', 'department')}
      {submitState.errors.department && (
        <p className="form-error">{submitState.errors.department}</p>
      )}
      {renderEditableRow('building-icon', 'Building', 'building')}
      {submitState.errors.building && (
        <p className="form-error">{submitState.errors.building}</p>
      )}

      {renderEditableRow('door-icon', 'Room', 'room')}
      {submitState.errors.room && (
        <p className="form-error">{submitState.errors.room}</p>
      )}

      {renderEditableRow('hashtag-icon', 'Desk Number', 'desk_number')}
      {submitState.errors.desk_number && (
        <p className="form-error">{submitState.errors.desk_number}</p>
      )}

      {renderEditableRow('user-icon', 'First Native Name', 'first_native_name')}
      {submitState.errors.first_native_name && (
        <p className="form-error">{submitState.errors.first_native_name}</p>
      )}

      {renderEditableRow('user-icon', 'Last Native Name', 'last_native_name')}
      {submitState.errors.last_native_name && (
        <p className="form-error">{submitState.errors.last_native_name}</p>
      )}

      {renderEditableRow('calendar-icon', 'Date of Birth', 'date_birth')}
      {submitState.errors.date_birth && (
        <p className="form-error">{submitState.errors.date_birth}</p>
      )}

      <h2 className="details-section__general">Contacts</h2>
      {renderEditableRow('mobile-icon', 'Phone', 'phone')}
      {submitState.errors.phone && (
        <p className="form-error">{submitState.errors.phone}</p>
      )}

      {renderEditableRow('at-icon', 'Email', 'email')}
      {submitState.errors.email && (
        <p className="form-error">{submitState.errors.email}</p>
      )}

      {renderEditableRow('zoom-icon', 'Zoom ID', 'zoom_id')}
      {submitState.errors.zoom_id && (
        <p className="form-error">{submitState.errors.zoom_id}</p>
      )}

      {renderEditableRow('zoom-icon', 'Zoom Link', 'zoom_link')}
      {submitState.errors.zoom_link && (
        <p className="form-error">{submitState.errors.zoom_link}</p>
      )}

      <h2 className="details-section__general">Travel Info</h2>
      {renderEditableRow('globe-icon', 'Citizenship', 'citizenship')}
      {submitState.errors.citizenship && (
        <p className="form-error">{submitState.errors.citizenship}</p>
      )}

      <VisaEditorList visas={formData.visas} onVisaChange={handleVisaChange} />

      {submitState.statusMessage && submitState.statusType === 'error' && (
        <p className="form-error">{submitState.statusMessage}</p>
      )}

      <div className="details-section__btns">
        <BtnSubmit
          isLoading={isPending || isLoading}
          message="Saving..."
          className="details-section__row-save"
        >
          Save
        </BtnSubmit>
        <button
          type="button"
          className="details-section__row-cancel"
          onClick={onCancel}
          disabled={isPending || isLoading}
        >
          {isPending || isLoading ? 'Canceling...' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
