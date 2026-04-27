import {
  EmployeeEditAction,
  EmployeeEditActionType,
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
