import React, { useReducer } from 'react';
import { IRequestData } from '../../types/type';
import { useAddRequestMutation } from '../../features/RequestsApi';
import { getLoggedInUser, validateRequest } from '../../utils/core';
import { useGetUsersQuery } from '../../features/usersApi';

interface FormState {
  data: IRequestData;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

const initialState: FormState = {
  data: {
    id: '',
    type: 'Vacation',
    start_date: '',
    end_date: '',
    note: '',
    status: 'pending',
    employeeId: '',
  },
  isSubmitting: false,
  errors: {},
};

type requestAction =
  | {
      type: 'SET_FIELD';
      field: keyof IRequestData;
      value: IRequestData[keyof IRequestData];
    }
  | {
      type: 'RESET_FORM';
    }
  | {
      type: 'SUBMIT_START';
    }
  | {
      type: 'SUBMIT_SUCCESS';
    }
  | {
      type: 'SUBMIT_ERROR';
      errors: Record<string, string>;
    };

function requestReducer(state: FormState, action: requestAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
      };
    case 'RESET_FORM':
      return {
        ...initialState,
      };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, errors: {} };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, errors: action.errors };

    default:
      return state;
  }
}

export default function RequestForm(): React.ReactElement {
  const { data: allUsers = [] } = useGetUsersQuery();

  const [state, dispatch] = useReducer(requestReducer, initialState);
  const [addRequest, { isLoading, isError, error }] = useAddRequestMutation();

  const loggedInId = getLoggedInUser(allUsers)?._id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRequest(state.data);
    console.log(state.data.start_date);
    if (Object.keys(validationErrors).length > 0) {
      dispatch({ type: 'SUBMIT_ERROR', errors: validationErrors });
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

      dispatch({ type: 'RESET_FORM' });
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
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'type',
                value: e.target.value,
              })
            }
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
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'start_date',
                  value: e.target.value,
                })
              }
            />
            {state.errors.start_date && (
              <p className="form-error">{state.errors.start_date}</p>
            )}
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'end_date',
                  value: e.target.value,
                })
              }
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
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'note',
                value: e.target.value,
              })
            }
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
