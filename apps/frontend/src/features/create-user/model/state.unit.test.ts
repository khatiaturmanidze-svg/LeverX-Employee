import { describe, expect, it } from 'vitest';
import { createReducer, setField, setVisa } from './state';
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
    middle_native_name: 'Middle',
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

  it('SET_FIELD updates the requested field only', () => {
    const initialState = createInitialState();
    const state = createReducer(initialState, setField('room', '202'));

    expect(state.formData.room).toBe('203');
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

  it('returns current state for unknown action types', () => {
    const initialState = createInitialState();
    const unknownAction = {
      type: 'UNKNOWN',
    } as unknown as EmployeeCreateAction;

    expect(createReducer(initialState, unknownAction)).toBe(initialState);
  });
});
