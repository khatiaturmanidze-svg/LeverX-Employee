import { CreateUserPayload } from '@/types/type';
import {
  EmployeeFormState,
  FormState,
  SubmitState,
} from '../model/state.types';
import { getErrorMessage } from '@/shared';
import { useAddUserMutation } from '../api/createUserApi';

export const initialState: FormState = {
  formData: {
    first_name: '',
    last_name: '',
    role: 'Employee',
    department: '',
    building: '',
    room: '',
    desk_number: '',
    isRemoteWork: false,
    phone: '',
    email: '',
    zoom_id: '',
    zoom_link: '',
    citizenship: '',
    first_native_name: '',
    middle_native_name: '',
    last_native_name: '',
    date_birth: '',
    manager_id: '',
    visas: [],
  },
};

export const initialSubmitState: SubmitState = {
  errors: {},
  statusMessage: '',
  statusType: null,
  temporaryPassword: '',
};

export const validateCreateUserForm = (
  formData: FormState['formData'],
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!formData.first_name.trim()) {
    errors.first_name = 'First name is required';
  }

  if (!formData.last_name.trim()) {
    errors.last_name = 'Last name is required';
  }

  if (!formData.role.trim()) {
    errors.role = 'Role is required';
  }

  if (!formData.department.trim()) {
    errors.department = 'Department is required';
  }

  if (!formData.building.trim()) {
    errors.building = 'Building is required';
  }

  if (!formData.room.trim()) {
    errors.room = 'Room is required';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailPattern.test(formData.email.trim())) {
    errors.email = 'Invalid email';
  }

  if (formData.desk_number && Number.isNaN(Number(formData.desk_number))) {
    errors.desk_number = 'Desk number must be a number';
  }

  return errors;
};

export const buildCreateUserPayload = (
  formData: EmployeeFormState,
): CreateUserPayload => ({
  first_name: formData.first_name.trim(),
  last_name: formData.last_name.trim(),
  role: formData.role,
  department: formData.department.trim(),
  building: formData.building.trim(),
  room: formData.room.trim(),
  desk_number: formData.desk_number ? Number(formData.desk_number) : null,
  isRemoteWork: formData.isRemoteWork,
  phone: formData.phone.trim() || undefined,
  email: formData.email.trim(),
  zoom_id: formData.zoom_id.trim() || undefined,
  zoom_link: formData.zoom_link.trim() || undefined,
  citizenship: formData.citizenship.trim() || undefined,
  first_native_name: formData.first_native_name.trim() || undefined,
  middle_native_name: formData.middle_native_name.trim() || undefined,
  last_native_name: formData.last_native_name.trim() || undefined,
  date_birth: formData.date_birth
    ? (() => {
        const [year, month, day] = formData.date_birth.split('-').map(Number);
        return { year, month, day };
      })()
    : undefined,
  visa: formData.visas,
});

export async function submitCreateUser(
  formState: EmployeeFormState,
  addUser: ReturnType<typeof useAddUserMutation>[0],
): Promise<SubmitState> {
  const validationErrors = validateCreateUserForm(formState);

  if (Object.keys(validationErrors).length > 0) {
    return {
      ...initialSubmitState,
      errors: validationErrors,
    };
  }

  try {
    const result = await addUser(buildCreateUserPayload(formState)).unwrap();

    return {
      ...initialSubmitState,
      statusMessage: 'Employee created successfully.',
      statusType: 'success',
      temporaryPassword: result.temporaryPassword,
    };
  } catch (err) {
    const message = getErrorMessage(err);

    return {
      ...initialSubmitState,
      errors: { submit: message },
      statusMessage: message,
      statusType: 'error',
      temporaryPassword: '',
    };
  }
}
