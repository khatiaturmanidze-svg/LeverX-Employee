import {
  RequestActionType,
  RequestAction,
  IRequestData,
  SubmitErrorAction,
  SetFieldAction,
  ResetFormAction,
} from './state.types';
import { FormState } from './state.types';

export const initialState: FormState = {
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

export function requestReducer(
  state: FormState,
  action: RequestAction,
): FormState {
  switch (action.type) {
    case RequestActionType.SET_FIELD:
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
      };
    case RequestActionType.RESET_FORM:
      return {
        ...initialState,
      };
    case RequestActionType.SUBMIT_START:
      return { ...state, isSubmitting: true };
    case RequestActionType.SUBMIT_SUCCESS:
      return { ...state, isSubmitting: false, errors: {} };
    case RequestActionType.SUBMIT_ERROR:
      return { ...state, isSubmitting: false, errors: action.errors };

    default:
      return state;
  }
}

export const submitError = (
  errors: Record<string, string>,
): SubmitErrorAction => ({
  type: RequestActionType.SUBMIT_ERROR,
  errors,
});

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
