import React, { useReducer } from 'react';

import { useAddRequestMutation } from '../../features/requests/RequestsApi';
import { getLoggedInUser, validateRequest } from '../../utils/core';
import { useGetUsersQuery } from '../../features/usersApi';

import {
  requestReducer,
  initialState,
  resetForm,
  setField,
  submitError,
} from '../../features/requests/requestForm/state';

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
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            className="request-list__select"
            onChange={(e) => dispatch(setField('type', e.target.value))}
          >
            <option>Vacation</option>
            <option>Sick leave</option>
            <option>Military leave</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              onChange={(e) => dispatch(setField('start_date', e.target.value))}
            />
            {state.errors.start_date && (
              <p className="form-error">{state.errors.start_date}</p>
            )}
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              onChange={(e) => dispatch(setField('end_date', e.target.value))}
            />
            {state.errors.end_date && (
              <p className="form-error">{state.errors.end_date}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Note</label>
          <textarea
            placeholder="Reason for leave..."
            onChange={(e) => dispatch(setField('note', e.target.value))}
          ></textarea>
          {state.errors.note && (
            <p className="form-error">{state.errors.note}</p>
          )}
        </div>

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
