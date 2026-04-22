import { describe, expect, it } from 'vitest';
import { initialState, requestReducer, resetForm, setField } from './state';
import { RequestAction, RequestActionType } from './state.types';
import { getInitialState } from '../lib/helpers';

describe('requests state reducer/actions', () => {
  it('setField action creator returns the correct shape', () => {
    const action = setField('type', 'Sick leave');
    expect(action).toEqual({
      type: RequestActionType.SET_FIELD,
      field: 'type',
      value: 'Sick leave',
    });
  });

  it('resetForm action creator returns the correct type', () => {
    expect(resetForm()).toEqual({
      type: RequestActionType.RESET_FORM,
    });
  });

  it('SET_FIELD updates only requested field in formData', () => {
    const state = requestReducer(
      getInitialState(initialState),
      setField('note', 'Family event'),
    );

    expect(state.formData.note).toBe('Family event');
    expect(state.formData.type).toBe(initialState.type);
    expect(state.formData.start_date).toBe(initialState.start_date);
  });

  it('RESET_FORM returns initialState from dirty state', () => {
    const dirtyState = getInitialState({
      ...initialState,
      type: 'Military leave',
      note: 'Changed',
    });

    const state = requestReducer(dirtyState, resetForm());
    expect(state).toEqual(getInitialState(initialState));
  });

  it('getInitialState wraps request data into formData', () => {
    const state = getInitialState({
      ...initialState,
      note: 'Trip',
    });

    expect(state).toEqual({
      formData: {
        ...initialState,
        note: 'Trip',
      },
    });
  });

  it('returns current state for unknown action type', () => {
    const unknownAction = {
      type: 'UNKNOWN_ACTION',
    } as unknown as RequestAction;
    const state = requestReducer(getInitialState(initialState), unknownAction);

    expect(state).toEqual(getInitialState(initialState));
  });
});
