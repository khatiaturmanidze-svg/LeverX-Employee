import {
  RequestActionType,
  RequestAction,
  IRequestData,
  SetFieldAction,
  ResetFormAction,
} from './state.types';
import { FormState } from './state.types';

export const initialState: IRequestData = {
  id: '',
  type: 'Vacation',
  start_date: '',
  end_date: '',
  note: '',
  status: 'pending',
  employeeId: '',
};

export function requestReducer(
  state: FormState,
  action: RequestAction,
): FormState {
  switch (action.type) {
    case RequestActionType.SET_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };
    case RequestActionType.RESET_FORM:
      return {
        formData: { ...initialState },
      };
    default:
      return state;
  }
}

export const setField = <K extends keyof IRequestData>(
  field: K,
  value: IRequestData[K],
): SetFieldAction => ({
  type: RequestActionType.SET_FIELD,
  field,
  value,
});

export const resetForm = (): ResetFormAction => ({
  type: RequestActionType.RESET_FORM,
});
