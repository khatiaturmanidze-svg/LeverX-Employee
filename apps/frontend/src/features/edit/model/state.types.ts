import { IVisa } from '@/types/type';

export type EmployeeFormState = {
  department: string;
  building: string;
  room: string;
  desk_number: string;
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
}
export enum EmployeeEditActionType {
  SET_FIELD = 'SET_FIELD',
  SET_VISA = 'SET_VISA',
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

// current result of action
export interface SubmitState {
  errors: Record<string, string>;
  statusMessage: string;
  statusType: 'success' | 'error' | null;
}

export type EmployeeEditAction = SetFieldAction | SetVisaAction;
