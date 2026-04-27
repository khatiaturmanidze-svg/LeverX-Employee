import React, { useActionState, useReducer } from 'react';
import { useAddRequestMutation } from '../api/RequestsApi';
import {
  requestReducer,
  initialState,
  resetForm,
  setField,
} from '../model/state';
import { InputField, FormGroup, BtnSubmit, LazyImage } from '@shared/ui';
import { getInitialState, submitRequest } from '../lib/helpers';
import { SubmitState } from '../model/state.types';
import { getLoggedInUser, initialSubmitState } from '@shared/lib';
import { useGetUsersQuery } from '../../usersApi';

export default function RequestForm(): React.ReactElement {
  const { data: allUsers = [] } = useGetUsersQuery();
  const [state, dispatch] = useReducer(
    requestReducer,
    initialState,
    getInitialState,
  );
  const [addRequest] = useAddRequestMutation();
  const { formData } = state;

  const [submitState, submitAction, isPending] = useActionState<
    SubmitState,
    FormData
  >(async () => {
    const loggedInUser = getLoggedInUser(allUsers);
    const result = await submitRequest(
      formData,
      loggedInUser?._id ?? '',
      addRequest,
    );

    if (result.statusType === 'success') {
      dispatch(resetForm());
    }

    return result;
  }, initialSubmitState);

  return (
    <div className="request-form card">
      <LazyImage
        src="../assets/vacation-bg.jpg"
        alt="vacation picture"
        className="request-form__img"
        skeletonClassName="lazy-image--request"
      />
      <h2 className="request-form__title">New Request</h2>

      <form className="request-form__content" action={submitAction}>
        <FormGroup label={'Type'}>
          <select
            id="type"
            className="request-list__select"
            value={formData.type}
            onChange={(e) => dispatch(setField('type', e.target.value))}
            name="type"
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
              value={formData.start_date}
              onChange={(e) => dispatch(setField('start_date', e.target.value))}
              error={submitState.errors.start_date}
              name="start_date"
            />
          </FormGroup>
          <FormGroup label={'End Date'}>
            <InputField
              type="date"
              value={formData.end_date}
              onChange={(e) => dispatch(setField('end_date', e.target.value))}
              error={submitState.errors.end_date}
              name="end_date"
            />
          </FormGroup>
        </div>

        <FormGroup label={'Note'}>
          <textarea
            placeholder="Reason for leave..."
            value={formData.note}
            onChange={(e) => dispatch(setField('note', e.target.value))}
            name="note"
          ></textarea>
          {submitState.errors.note && (
            <p className="form-error">{submitState.errors.note}</p>
          )}
        </FormGroup>

        <BtnSubmit
          isLoading={isPending}
          message="Submitting"
          className="btn-submit"
        >
          Submit Request
        </BtnSubmit>

        {submitState.statusMessage && (
          <p
            className={
              submitState.statusType === 'success' ? 'form-success' : 'error'
            }
          >
            {submitState.statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}
