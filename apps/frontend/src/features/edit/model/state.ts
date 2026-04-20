import {
  EmployeeEditAction,
  EmployeeEditActionType,
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

export function editReducer(
  state: FormState,
  action: EmployeeEditAction,
): FormState {
  switch (action.type) {
    case EmployeeEditActionType.SET_FIELD:
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    case EmployeeEditActionType.SET_VISA: {
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
    case EmployeeEditActionType.SUBMIT_START:
      return { ...state, isSubmitting: true };
    case EmployeeEditActionType.SUBMIT_SUCCESS:
      return { ...state, isSubmitting: false, errors: {} };
    case EmployeeEditActionType.SUBMIT_ERROR:
      return { ...state, isSubmitting: false, errors: action.errors };
    default:
      return state;
  }
}

export const setField = <K extends keyof EmployeeFormState>(
  field: K,
  value: EmployeeFormState[K],
): SetFieldAction<K> => ({
  type: EmployeeEditActionType.SET_FIELD,
  field,
  value,
});

export const submitError = (
  errors: Record<string, string>,
): SubmitErrorAction => ({
  type: EmployeeEditActionType.SUBMIT_ERROR,
  errors,
});

export const setVisa = <K extends keyof IVisa>(
  index: number,
  field: K,
  value: IVisa[K],
): SetVisaAction<K> => ({
  type: EmployeeEditActionType.SET_VISA,
  index,
  field,
  value,
});

export const submitStart = (): SubmitStartAction => ({
  type: EmployeeEditActionType.SUBMIT_START,
});

export const submitSuccess = (): SubmitSuccessAction => ({
  type: EmployeeEditActionType.SUBMIT_SUCCESS,
});
