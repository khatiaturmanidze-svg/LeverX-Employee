import { useUpdateEmployeeMutation } from '@/features/usersApi';
import { EmployeeUpdate, IEmployee } from '../../../types/type';
import {
  EmployeeFormState,
  FormState,
  SubmitState,
} from '../model/state.types';
import { getErrorMessage, initialSubmitState } from '@shared/lib';

export const getEmployeeFormState = (user: IEmployee): EmployeeFormState => ({
  department: user.department,
  building: user.building,
  room: user.room,
  desk_number: user.desk_number?.toString() || '',
  phone: user.phone || '',
  email: user.email,
  zoom_id: user.zoom_id || '',
  zoom_link: user.zoom_link || '',
  citizenship: user.citizenship || '',

  first_native_name: user.first_native_name || '',
  last_native_name: user.last_native_name || '',
  date_birth: user.date_birth
    ? `${user.date_birth.year}-${String(user.date_birth.month).padStart(
        2,
        '0',
      )}-${String(user.date_birth.day).padStart(2, '0')}`
    : '',
  manager_id: user.manager?.id || '',

  visas:
    user.visa?.map((v) => ({
      issuing_country: v.issuing_country,
      type: v.type,
      start_date: v.start_date
        ? new Date(v.start_date).toISOString().slice(0, 10)
        : '',
      end_date: v.end_date
        ? new Date(v.end_date).toISOString().slice(0, 10)
        : '',
    })) || [],
});

export const validateEmployeeForm = (formData: EmployeeFormState) => {
  const errors: Record<string, string> = {};
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!formData.department) errors.department = 'Department is required';
  if (!formData.email) errors.email = 'Email is required';
  else if (!emailPattern.test(formData.email)) errors.email = 'Invalid email';
  if (formData.desk_number && isNaN(Number(formData.desk_number)))
    errors.desk_number = 'Desk number must be a number';

  if (formData.date_birth) {
    const [y, m, d] = formData.date_birth.split('-').map(Number);
    if (!y || y < 1900 || !m || m < 1 || m > 12 || !d || d < 1 || d > 31)
      errors.date_birth = 'input format should be year-month-day';
  }

  // visas
  formData.visas.forEach((v, i) => {
    if (!v.issuing_country) errors[`visa_${i}_country`] = 'Required';
    if (!v.type) errors[`visa_${i}_type`] = 'Required';
  });

  return errors;
};

export const getInitialState = (user: IEmployee): FormState => ({
  formData: getEmployeeFormState(user),
});

export const buildUpdatePayload = (
  formData: EmployeeFormState,
): EmployeeUpdate => ({
  department: formData.department,
  building: formData.building,
  room: formData.room,
  desk_number: formData.desk_number ? Number(formData.desk_number) : null,
  phone: formData.phone || undefined,
  email: formData.email,
  zoom_id: formData.zoom_id || undefined,
  zoom_link: formData.zoom_link || undefined,
  citizenship: formData.citizenship || undefined,
  first_native_name: formData.first_native_name || undefined,
  last_native_name: formData.last_native_name || undefined,
  date_birth: formData.date_birth
    ? (() => {
        const [year, month, day] = formData.date_birth.split('-').map(Number);
        return { year, month, day };
      })()
    : undefined,
  manager: formData.manager_id || undefined,
});

export async function submitEditUser(
  formState: EmployeeFormState,
  userId: string,
  updateEmployee: ReturnType<typeof useUpdateEmployeeMutation>[0],
): Promise<SubmitState> {
  const validationErrors = validateEmployeeForm(formState);

  if (Object.keys(validationErrors).length > 0) {
    return {
      ...initialSubmitState,
      errors: validationErrors,
    };
  }

  try {
    await updateEmployee({
      id: userId,
      update: buildUpdatePayload(formState),
    }).unwrap();

    return {
      ...initialSubmitState,
      statusMessage: 'Employee updated successfully.',
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
