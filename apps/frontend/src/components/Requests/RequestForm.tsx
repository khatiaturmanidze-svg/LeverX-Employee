import React, { useReducer } from 'react';

import { useAddRequestMutation } from '../../features/requests/RequestsApi';
import { getLoggedInUser, validateRequest } from '../../utils/core';
import { useGetUsersQuery } from '../../features/usersApi';
import { FormGroup } from './FormGroup';
import {
  requestReducer,
  initialState,
  resetForm,
  setField,
  submitError,
} from '../../features/requests/requestForm/state';
import { InputField } from './InputField';

export default function RequestForm(): React.ReactElement {
  const { data: allUsers = [] } = useGetUsersQuery();

  const [state, dispatch] = useReducer(requestReducer, initialState);
  const [addRequest, { isLoading, isError, error }] = useAddRequestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRequest(state.data);
    if (Object.keys(validationErrors).length > 0) {
      dispatch(submitError(validationErrors));
      return;
    }
    const loggedInId = getLoggedInUser(allUsers)?._id;

    if (!loggedInId) {
      console.error('User not found');
      return;
    }
    try {
      await addRequest({
        employeeId: loggedInId,
        body: {
          employeeId: state.data.employeeId,
          type: state.data.type,
          start_date: state.data.start_date,
          end_date: state.data.end_date,
          note: state.data.note,
          status: state.data.status,
        },
      }).unwrap();

      dispatch(resetForm());
    } catch (err) {
      console.error('Failed to save the request: ', err);
    }
  };
  return (
    <div className="request-form card">
      <img
        src="../assets/vacation-bg.jpg"
        alt="vacation picture"
        className="request-form__img"
      />
      <h2 className="request-form__title">New Request</h2>

      <form className="request-form__content" onSubmit={handleSubmit}>
        <FormGroup label={'Type'}>
          <select
            id="type"
            className="request-list__select"
            onChange={(e) => dispatch(setField('type', e.target.value))}
          >
            <option>Vacation</option>
            <option>Sick leave</option>
            <option>Military leave</option>
          </select>
        </FormGroup>

        <div className="form-row">
          <FormGroup label={'Start Date'}>
            <InputField
              type={'date'}
              onChange={(e) => dispatch(setField('start_date', e.target.value))}
              error={state.errors.start_date}
            />
          </FormGroup>
          <FormGroup label={'End Date'}>
            <InputField
              type="date"
              onChange={(e) => dispatch(setField('end_date', e.target.value))}
              error={state.errors.end_date}
            />
          </FormGroup>
        </div>

        <FormGroup label={'Note'}>
          <textarea
            placeholder="Reason for leave..."
            onChange={(e) => dispatch(setField('note', e.target.value))}
          ></textarea>
          {state.errors.note && (
            <p className="form-error">{state.errors.note}</p>
          )}
        </FormGroup>

        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>

        {isError && (
          <p className="error">Failed to submit: {JSON.stringify(error)}</p>
        )}
      </form>
    </div>
  );
}
