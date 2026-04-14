import { IVisa } from '@/types/type';

export type EmployeeFormState = {
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  building: string;
  room: string;
  desk_number: string;
  isRemoteWork: boolean;
  phone: string;
  email: string;
  zoom_id: string;
  zoom_link: string;
  citizenship: string;
  first_native_name: string;
  last_native_name: string;
  date_birth: string;
  manager_id: string;
  visas: IVisa[];
};

export interface FormState {
  formData: EmployeeFormState;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export enum EmployeeCreateActionType {
  SET_FIELD = 'SET_FIELD',
  SET_VISA = 'SET_VISA',
  SUBMIT_START = 'SUBMIT_START',
  SUBMIT_SUCCESS = 'SUBMIT_SUCCESS',
  SUBMIT_ERROR = 'SUBMIT_ERROR',
}

export type SetFieldAction<
  K extends keyof EmployeeFormState = keyof EmployeeFormState,
> = {
  type: EmployeeCreateActionType.SET_FIELD;
  field: K;
  value: EmployeeFormState[K];
};

export type SetVisaAction<K extends keyof IVisa = keyof IVisa> = {
  type: EmployeeCreateActionType.SET_VISA;
  index: number;
  field: K;
  value: IVisa[K];
};

export type SubmitStartAction = {
  type: EmployeeCreateActionType.SUBMIT_START;
};

export type SubmitSuccessAction = {
  type: EmployeeCreateActionType.SUBMIT_SUCCESS;
};

export type SubmitErrorAction = {
  type: EmployeeCreateActionType.SUBMIT_ERROR;
  errors: Record<string, string>;
};

export type EmployeeCreateAction =
  | SetFieldAction
  | SetVisaAction
  | SubmitStartAction
  | SubmitSuccessAction
  | SubmitErrorAction;
