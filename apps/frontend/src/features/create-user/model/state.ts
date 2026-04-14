import {
  EmployeeCreateAction,
  EmployeeCreateActionType,
  EmployeeFormState,
  FormState,
  SetFieldAction,
  SubmitErrorAction,
  SetVisaAction,
  SubmitStartAction,
  SubmitSuccessAction,
} from './state.types';

import { IVisa } from '@/types/type';

const defaultVisa: IVisa = {
  issuing_country: '',
  type: '',
  start_date: '',
  end_date: '',
};

export function createReducer(
  state: FormState,
  action: EmployeeCreateAction,
): FormState {
  switch (action.type) {
    case EmployeeCreateActionType.SET_FIELD:
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    case EmployeeCreateActionType.SET_VISA: {
      const visas = [...(state.formData.visas || [])];
      visas[action.index] = {
        ...(visas[action.index] || defaultVisa),
        [action.field]: action.value,
      };
      return {
        ...state,
        formData: { ...state.formData, visas },
      };
    }
    case EmployeeCreateActionType.SUBMIT_START:
      return { ...state, isSubmitting: true };
    case EmployeeCreateActionType.SUBMIT_SUCCESS:
      return { ...state, isSubmitting: false, errors: {} };
    case EmployeeCreateActionType.SUBMIT_ERROR:
      return { ...state, isSubmitting: false, errors: action.errors };
    default:
      return state;
  }
}

export const setField = <K extends keyof EmployeeFormState>(
  field: K,
  value: EmployeeFormState[K],
): SetFieldAction<K> => ({
  type: EmployeeCreateActionType.SET_FIELD,
  field,
  value,
});

export const setVisa = <K extends keyof IVisa>(
  index: number,
  field: K,
  value: IVisa[K],
): SetVisaAction<K> => ({
  type: EmployeeCreateActionType.SET_VISA,
  index,
  field,
  value,
});

export const submitStart = (): SubmitStartAction => ({
  type: EmployeeCreateActionType.SUBMIT_START,
});

export const submitSuccess = (): SubmitSuccessAction => ({
  type: EmployeeCreateActionType.SUBMIT_SUCCESS,
});

export const submitError = (
  errors: Record<string, string>,
): SubmitErrorAction => ({
  type: EmployeeCreateActionType.SUBMIT_ERROR,
  errors,
});
