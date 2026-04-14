import React, { useReducer, useState } from 'react';
import { FormGroup, InputField } from '@shared/ui';
import { initialState, validateCreateUserForm } from '../lib/helpers';
import {
  createReducer,
  setField,
  submitError,
  submitStart,
  submitSuccess,
} from '../model/state';

export default function CreateUserForm(): React.ReactElement {
  const [state, dispatch] = useReducer(createReducer, initialState);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(submitStart());
    setStatusMessage('');

    const validationErrors = validateCreateUserForm(state.formData);
    if (Object.keys(validationErrors).length > 0) {
      dispatch(submitError(validationErrors));
      return;
    }

    dispatch(submitSuccess());
    setStatusMessage('Form is ready for create-user API integration.');
  };

  return (
    <form className="create-user-form card" onSubmit={handleSubmit}>
      <h2 className="create-user-form__title">Employee Information</h2>

      <FormGroup
        className="details-section__row"
        label="First Name"
        htmlFor="first_name"
        icon="user-icon"
      >
        <InputField
          id="first_name"
          name="first_name"
          type="text"
          value={state.formData.first_name}
          placeholder="Enter first name"
          autoComplete="given-name"
          onChange={(e) => dispatch(setField('first_name', e.target.value))}
          error={state.errors.first_name}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Last Name"
        htmlFor="last_name"
        icon="user-icon"
      >
        <InputField
          id="last_name"
          name="last_name"
          type="text"
          value={state.formData.last_name}
          placeholder="Enter last name"
          autoComplete="family-name"
          onChange={(e) => dispatch(setField('last_name', e.target.value))}
          error={state.errors.last_name}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Role"
        htmlFor="role"
        icon="briefcase-icon"
      >
        <select
          id="role"
          value={state.formData.role}
          onChange={(e) => dispatch(setField('role', e.target.value))}
          className="edit-input"
        >
          <option value="Employee">Employee</option>
          <option value="HR">HR</option>
          <option value="Admin">Admin</option>
        </select>
        {state.errors.role && <p className="form-error">{state.errors.role}</p>}
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Department"
        htmlFor="department"
        icon="briefcase-icon"
      >
        <InputField
          id="department"
          name="department"
          type="text"
          value={state.formData.department}
          placeholder="Enter department"
          onChange={(e) => dispatch(setField('department', e.target.value))}
          error={state.errors.department}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Email"
        htmlFor="email"
        icon="at-icon"
      >
        <InputField
          id="email"
          name="email"
          type="email"
          value={state.formData.email}
          placeholder="name@company.com"
          autoComplete="email"
          onChange={(e) => dispatch(setField('email', e.target.value))}
          error={state.errors.email}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Phone"
        htmlFor="phone"
        icon="mobile-icon"
      >
        <InputField
          id="phone"
          name="phone"
          type="tel"
          value={state.formData.phone}
          placeholder="Enter phone number"
          autoComplete="tel"
          onChange={(e) => dispatch(setField('phone', e.target.value))}
          error={state.errors.phone}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Building"
        htmlFor="building"
        icon="building-icon"
      >
        <InputField
          id="building"
          name="building"
          type="text"
          value={state.formData.building}
          placeholder="Office building"
          onChange={(e) => dispatch(setField('building', e.target.value))}
          error={state.errors.building}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Room"
        htmlFor="room"
        icon="door-icon"
      >
        <InputField
          id="room"
          name="room"
          type="text"
          value={state.formData.room}
          placeholder="Room number"
          onChange={(e) => dispatch(setField('room', e.target.value))}
          error={state.errors.room}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Desk Number"
        htmlFor="desk_number"
        icon="hashtag-icon"
      >
        <InputField
          id="desk_number"
          name="desk_number"
          type="text"
          value={state.formData.desk_number}
          placeholder="Desk number"
          onChange={(e) => dispatch(setField('desk_number', e.target.value))}
          error={state.errors.desk_number}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Zoom ID"
        htmlFor="zoom_id"
        icon="zoom-icon"
      >
        <InputField
          id="zoom_id"
          name="zoom_id"
          type="text"
          value={state.formData.zoom_id}
          placeholder="Zoom ID"
          onChange={(e) => dispatch(setField('zoom_id', e.target.value))}
          error={state.errors.zoom_id}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Zoom Link"
        htmlFor="zoom_link"
        icon="zoom-icon"
      >
        <InputField
          id="zoom_link"
          name="zoom_link"
          type="url"
          value={state.formData.zoom_link}
          placeholder="https://..."
          onChange={(e) => dispatch(setField('zoom_link', e.target.value))}
          error={state.errors.zoom_link}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="First Native Name"
        htmlFor="first_native_name"
        icon="user-icon"
      >
        <InputField
          id="first_native_name"
          name="first_native_name"
          type="text"
          value={state.formData.first_native_name}
          placeholder="Optional"
          onChange={(e) =>
            dispatch(setField('first_native_name', e.target.value))
          }
          error={state.errors.first_native_name}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Last Native Name"
        htmlFor="last_native_name"
        icon="user-icon"
      >
        <InputField
          id="last_native_name"
          name="last_native_name"
          type="text"
          value={state.formData.last_native_name}
          placeholder="Optional"
          onChange={(e) =>
            dispatch(setField('last_native_name', e.target.value))
          }
          error={state.errors.last_native_name}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Citizenship"
        htmlFor="citizenship"
        icon="globe-icon"
      >
        <InputField
          id="citizenship"
          name="citizenship"
          type="text"
          value={state.formData.citizenship}
          placeholder="Optional"
          onChange={(e) => dispatch(setField('citizenship', e.target.value))}
          error={state.errors.citizenship}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row"
        label="Date of Birth"
        htmlFor="date_birth"
        icon="calendar-icon"
      >
        <InputField
          id="date_birth"
          name="date_birth"
          type="date"
          value={state.formData.date_birth}
          onChange={(e) => dispatch(setField('date_birth', e.target.value))}
          error={state.errors.date_birth}
        />
      </FormGroup>

      <FormGroup
        className="details-section__row remote-check"
        label="Remote Work"
        htmlFor="isRemoteWork"
        icon="building-icon"
      >
        <input
          id="isRemoteWork"
          type="checkbox"
          checked={state.formData.isRemoteWork}
          onChange={(e) => dispatch(setField('isRemoteWork', e.target.checked))}
        />
      </FormGroup>

      <button
        type="submit"
        className="btn-submit create-user-form__submit"
        disabled={state.isSubmitting}
      >
        {state.isSubmitting ? 'Checking...' : 'Create Employee'}
      </button>

      {statusMessage && <p className="form-error">{statusMessage}</p>}
    </form>
  );
}
