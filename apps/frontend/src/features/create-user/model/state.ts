import {
  EmployeeCreateAction,
  EmployeeCreateActionType,
  EmployeeFormState,
  FormState,
  SetFieldAction,
  SetVisaAction,
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
