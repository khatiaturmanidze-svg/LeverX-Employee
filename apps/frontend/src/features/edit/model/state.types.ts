import { getEmployeeFormState } from '../lib/helpers';
import { IVisa } from '@/types/type';

export type EmployeeFormState = ReturnType<typeof getEmployeeFormState> & {
  visas: IVisa[];
};

export interface FormState {
  formData: EmployeeFormState;
  isSubmitting: boolean;
  errors: Record<string, string>;
}
export enum EmployeeEditActionType {
  SET_FIELD = 'SET_FIELD',
  SET_VISA = 'SET_VISA',
  SUBMIT_START = 'SUBMIT_START',
  SUBMIT_SUCCESS = 'SUBMIT_SUCCESS',
  SUBMIT_ERROR = 'SUBMIT_ERROR',
}

export type SetFieldAction<
  K extends keyof EmployeeFormState = keyof EmployeeFormState,
> = {
  type: EmployeeEditActionType.SET_FIELD;
  field: K;
  value: EmployeeFormState[K];
};

export type SetVisaAction<K extends keyof IVisa = keyof IVisa> = {
  type: EmployeeEditActionType.SET_VISA;
  index: number;
  field: K;
  value: IVisa[K];
};

export type SubmitStartAction = {
  type: EmployeeEditActionType.SUBMIT_START;
};

export type SubmitSuccessAction = {
  type: EmployeeEditActionType.SUBMIT_SUCCESS;
};

export type SubmitErrorAction = {
  type: EmployeeEditActionType.SUBMIT_ERROR;
  errors: Record<string, string>;
};

export type EmployeeEditAction =
  | SetFieldAction
  | SetVisaAction
  | SubmitStartAction
  | SubmitSuccessAction
  | SubmitErrorAction;
