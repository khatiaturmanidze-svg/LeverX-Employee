export type SetFieldAction = {
  type: RequestActionType.SET_FIELD;
  field: keyof IRequestData;
  value: IRequestData[keyof IRequestData];
};

export type ResetFormAction = {
  type: RequestActionType.RESET_FORM;
};

export type SubmitStartAction = {
  type: RequestActionType.SUBMIT_START;
};

export type SubmitSuccessAction = {
  type: RequestActionType.SUBMIT_SUCCESS;
};

export type SubmitErrorAction = {
  type: RequestActionType.SUBMIT_ERROR;
  errors: Record<string, string>;
};

export enum RequestActionType {
  SET_FIELD = 'SET_FIELD',
  RESET_FORM = 'RESET_FORM',
  SUBMIT_START = 'SUBMIT_START',
  SUBMIT_SUCCESS = 'SUBMIT_SUCCESS',
  SUBMIT_ERROR = 'SUBMIT_ERROR',
}

export interface IRequestData {
  id: string;
  type: string;
  start_date: string;
  employeeId: string;
  end_date: string;
  note: string;

  status: 'approved' | 'pending' | 'rejected';
}

export type RequestUpdate = Partial<Omit<IRequestData, 'id'>> & {
  manager?: string | null;
};

export type RequestAction =
  | SetFieldAction
  | ResetFormAction
  | SubmitStartAction
  | SubmitSuccessAction
  | SubmitErrorAction;

export interface FormState {
  data: IRequestData;
  isSubmitting: boolean;
  errors: Record<string, string>;
}
