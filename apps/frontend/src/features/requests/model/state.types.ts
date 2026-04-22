export type SetFieldAction = {
  type: RequestActionType.SET_FIELD;
  field: keyof IRequestData;
  value: IRequestData[keyof IRequestData];
};

export type ResetFormAction = {
  type: RequestActionType.RESET_FORM;
};

export enum RequestActionType {
  SET_FIELD = 'SET_FIELD',
  RESET_FORM = 'RESET_FORM',
}

export type IRequestData = {
  id: string;
  type: string;
  start_date: string;
  employeeId: string;
  end_date: string;
  note: string;

  status: 'approved' | 'pending' | 'rejected';
};

export interface FormState {
  formData: IRequestData;
}

export interface SubmitState {
  errors: Record<string, string>;
  statusMessage: string;
  statusType: 'success' | 'error' | null;
}

export type RequestUpdate = Partial<Omit<IRequestData, 'id'>> & {
  manager?: string | null;
};

export type RequestAction = SetFieldAction | ResetFormAction;
