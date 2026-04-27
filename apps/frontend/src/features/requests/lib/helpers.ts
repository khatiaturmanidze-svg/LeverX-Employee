import { FormState, IRequestData, SubmitState } from '../model/state.types';
import { useAddRequestMutation } from '../api/RequestsApi';
import {
  getErrorMessage,
  initialSubmitState,
  validateRequest,
} from '@shared/lib';

export const getRequestFormState = (request: IRequestData): IRequestData => ({
  id: request.id,
  type: request.type,
  start_date: request.start_date,
  end_date: request.end_date,
  note: request.note,
  status: request.status,
  employeeId: request.employeeId,
});

export const buildRequestPayload = (
  formData: IRequestData,
): Omit<IRequestData, 'id'> => ({
  type: formData.type,
  start_date: formData.start_date,
  employeeId: formData.employeeId,
  end_date: formData.end_date,
  note: formData.note,
  status: formData.status,
});

export async function submitRequest(
  formState: IRequestData,
  userId: string,
  addRequest: ReturnType<typeof useAddRequestMutation>[0],
): Promise<SubmitState> {
  const validationErrors = validateRequest(formState);

  if (Object.keys(validationErrors).length > 0) {
    return {
      ...initialSubmitState,
      errors: validationErrors,
    };
  }

  if (!userId) {
    return {
      ...initialSubmitState,
      errors: { submit: 'User not found' },
      statusMessage: 'User not found',
      statusType: 'error',
    };
  }

  try {
    await addRequest({
      employeeId: userId,
      body: buildRequestPayload(formState),
    }).unwrap();

    return {
      ...initialSubmitState,
      statusMessage: 'Request added successfully',
      statusType: 'success',
    };
  } catch (err) {
    const message = getErrorMessage(err);

    return {
      ...initialSubmitState,
      errors: { submit: message },
      statusMessage: message,
      statusType: 'error',
    };
  }
}

export const getInitialState = (request: IRequestData): FormState => ({
  formData: getRequestFormState(request),
});

// export const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   const validationErrors = validateRequest(state.data);
//   if (Object.keys(validationErrors).length > 0) {
//     dispatch(submitError(validationErrors));
//     return;
//   }
//   const loggedInId = getLoggedInUser(allUsers)?._id;

//   if (!loggedInId) {
//     console.error('User not found');
//     return;
//   }
//   try {
//     await addRequest({
//       employeeId: loggedInId,
//       body: {
//         employeeId: state.data.employeeId,
//         type: state.data.type,
//         start_date: state.data.start_date,
//         end_date: state.data.end_date,
//         note: state.data.note,
//         status: state.data.status,
//       },
//     }).unwrap();

//     dispatch(resetForm());
//   } catch (err) {
//     console.error('Failed to save the request: ', err);
//   }
// };
