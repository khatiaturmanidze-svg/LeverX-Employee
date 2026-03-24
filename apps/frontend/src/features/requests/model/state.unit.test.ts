import { describe, expect, it } from 'vitest';
import {
  initialState,
  requestReducer,
  resetForm,
  setField,
  submitError,
} from './state';
import { RequestAction, RequestActionType } from './state.types';

describe('requests state reducer/actions', () => {
  it('setField action creator returns the correct shape', () => {
    const action = setField('type', 'Sick leave');
    expect(action).toEqual({
      type: RequestActionType.SET_FIELD,
      field: 'type',
      value: 'Sick leave',
    });
  });

  it('submitError action creator returns the correct shape', () => {
    const errors = { start_date: 'Start date is required' };
    const action = submitError(errors);

    expect(action).toEqual({
      type: RequestActionType.SUBMIT_ERROR,
      errors,
    });
  });

  it('resetForm action creator returns the correct type', () => {
    expect(resetForm()).toEqual({
      type: RequestActionType.RESET_FORM,
    });
  });

  it('SET_FIELD updates only requested field in data', () => {
    const state = requestReducer(
      initialState,
      setField('note', 'Family event'),
    );

    expect(state.data.note).toBe('Family event');
    expect(state.data.type).toBe(initialState.data.type);
    expect(state.isSubmitting).toBe(initialState.isSubmitting);
  });

  it('RESET_FORM returns initialState from dirty state', () => {
    const dirtyState = {
      ...initialState,
      data: {
        ...initialState.data,
        type: 'Military leave',
        note: 'Changed',
      },
      isSubmitting: true,
      errors: { end_date: 'Invalid date' },
    };

    const state = requestReducer(dirtyState, resetForm());
    expect(state).toEqual(initialState);
  });

  it('SUBMIT_START sets isSubmitting to true', () => {
    const state = requestReducer(initialState, {
      type: RequestActionType.SUBMIT_START,
    });

    expect(state.isSubmitting).toBe(true);
  });

  it('SUBMIT_SUCCESS clears submitting state and errors', () => {
    const prevState = {
      ...initialState,
      isSubmitting: true,
      errors: { start_date: 'Required' },
    };

    const state = requestReducer(prevState, {
      type: RequestActionType.SUBMIT_SUCCESS,
    });

    expect(state.isSubmitting).toBe(false);
    expect(state.errors).toEqual({});
  });

  it('SUBMIT_ERROR stores errors and clears submitting flag', () => {
    const prevState = {
      ...initialState,
      isSubmitting: true,
    };
    const errors = { start_date: 'Start date is required' };

    const state = requestReducer(prevState, submitError(errors));

    expect(state.isSubmitting).toBe(false);
    expect(state.errors).toEqual(errors);
  });

  it('returns current state for unknown action type', () => {
    const unknownAction = {
      type: 'UNKNOWN_ACTION',
    } as unknown as RequestAction;
    const state = requestReducer(initialState, unknownAction);

    expect(state).toBe(initialState);
  });
});
