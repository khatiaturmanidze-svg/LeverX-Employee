import { describe, expect, it } from 'vitest';
import {
  createReducer,
  setField,
  setVisa,
  submitError,
  submitStart,
  submitSuccess,
} from './state';
import {
  EmployeeCreateAction,
  EmployeeCreateActionType,
  FormState,
} from './state.types';

const createInitialState = (): FormState => ({
  formData: {
    first_name: 'John',
    last_name: 'Doe',
    role: 'Employee',
    department: 'Engineering',
    building: 'HQ',
    room: '101',
    desk_number: '12',
    isRemoteWork: false,
    phone: '+123456789',
    email: 'john@example.com',
    zoom_id: 'john-doe',
    zoom_link: 'https://zoom.us/j/123',
    citizenship: 'GE',
    first_native_name: 'John',
    last_native_name: 'Doe',
    date_birth: '1992-05-10',
    manager_id: '1',
    visas: [
      {
        issuing_country: 'GE',
        type: 'Work',
        start_date: '2024-01-01',
        end_date: '2025-01-01',
      },
    ],
  },
  isSubmitting: false,
  errors: {},
});

describe('create-user state reducer/actions', () => {
  it('setField action creator returns the correct shape', () => {
    expect(setField('department', 'HR')).toEqual({
      type: EmployeeCreateActionType.SET_FIELD,
      field: 'department',
      value: 'HR',
    });
  });

  it('setVisa action creator returns the correct shape', () => {
    expect(setVisa(0, 'type', 'Business')).toEqual({
      type: EmployeeCreateActionType.SET_VISA,
      index: 0,
      field: 'type',
      value: 'Business',
    });
  });

  it('submitStart and submitSuccess action creators return expected types', () => {
    expect(submitStart()).toEqual({
      type: EmployeeCreateActionType.SUBMIT_START,
    });
    expect(submitSuccess()).toEqual({
      type: EmployeeCreateActionType.SUBMIT_SUCCESS,
    });
  });

  it('submitError action creator stores errors', () => {
    const errors = { email: 'Already used' };

    expect(submitError(errors)).toEqual({
      type: EmployeeCreateActionType.SUBMIT_ERROR,
      errors,
    });
  });

  it('SET_FIELD updates the requested field only', () => {
    const initialState = createInitialState();
    const state = createReducer(initialState, setField('room', '202'));

    expect(state.formData.room).toBe('202');
    expect(state.formData.email).toBe(initialState.formData.email);
  });

  it('SET_VISA updates an existing visa entry', () => {
    const initialState = createInitialState();
    const state = createReducer(initialState, setVisa(0, 'type', 'Residence'));

    expect(state.formData.visas[0].type).toBe('Residence');
    expect(state.formData.visas[0].issuing_country).toBe('GE');
  });

  it('SET_VISA creates a default visa for a missing index', () => {
    const initialState = createInitialState();
    const state = createReducer(
      initialState,
      setVisa(2, 'issuing_country', 'US'),
    );

    expect(state.formData.visas[2]).toEqual({
      issuing_country: 'US',
      type: '',
      start_date: '',
      end_date: '',
    });
  });

  it('SUBMIT_START sets submitting state', () => {
    const state = createReducer(createInitialState(), submitStart());

    expect(state.isSubmitting).toBe(true);
  });

  it('SUBMIT_SUCCESS clears submitting state and errors', () => {
    const state = createReducer(
      {
        ...createInitialState(),
        isSubmitting: true,
        errors: { email: 'Wrong' },
      },
      submitSuccess(),
    );

    expect(state.isSubmitting).toBe(false);
    expect(state.errors).toEqual({});
  });

  it('SUBMIT_ERROR stores errors and clears submitting state', () => {
    const state = createReducer(
      {
        ...createInitialState(),
        isSubmitting: true,
      },
      submitError({ submit: 'Failed' }),
    );

    expect(state.isSubmitting).toBe(false);
    expect(state.errors).toEqual({ submit: 'Failed' });
  });

  it('returns current state for unknown action types', () => {
    const initialState = createInitialState();
    const unknownAction = {
      type: 'UNKNOWN',
    } as unknown as EmployeeCreateAction;

    expect(createReducer(initialState, unknownAction)).toBe(initialState);
  });
});
