import { describe, expect, it } from 'vitest';
import { editReducer, setField, setVisa } from './state';
import {
  EmployeeEditAction,
  EmployeeEditActionType,
  FormState,
} from './state.types';

const createInitialState = (): FormState => ({
  formData: {
    department: 'Engineering',
    building: 'A',
    room: '201',
    desk_number: '15',
    phone: '+995500000000',
    email: 'john@example.com',
    zoom_id: 'john-doe',
    zoom_link: 'https://zoom.us/j/123456789',
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
});

describe('edit state reducer/actions', () => {
  it('setField action creator returns the correct shape', () => {
    const action = setField('department', 'Marketing');

    expect(action).toEqual({
      type: EmployeeEditActionType.SET_FIELD,
      field: 'department',
      value: 'Marketing',
    });
  });

  it('setVisa action creator returns the correct shape', () => {
    const action = setVisa(1, 'type', 'Business');

    expect(action).toEqual({
      type: EmployeeEditActionType.SET_VISA,
      index: 1,
      field: 'type',
      value: 'Business',
    });
  });

  it('SET_FIELD updates only requested field in formData', () => {
    const initialState = createInitialState();
    const state = editReducer(
      initialState,
      setField('department', 'Marketing'),
    );

    expect(state.formData.department).toBe('Marketing');
    expect(state.formData.email).toBe(initialState.formData.email);
  });

  it('SET_VISA updates existing visa entry', () => {
    const initialState = createInitialState();
    const state = editReducer(initialState, setVisa(0, 'type', 'Residence'));

    expect(state.formData.visas[0].type).toBe('Residence');
    expect(state.formData.visas[0].issuing_country).toBe('GE');
  });

  it('SET_VISA creates default visa entry for missing index', () => {
    const initialState = createInitialState();
    const state = editReducer(
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

  it('returns current state for unknown action type', () => {
    const initialState = createInitialState();
    const unknownAction = {
      type: 'UNKNOWN_ACTION',
    } as unknown as EmployeeEditAction;

    const state = editReducer(initialState, unknownAction);
    expect(state).toBe(initialState);
  });
});
