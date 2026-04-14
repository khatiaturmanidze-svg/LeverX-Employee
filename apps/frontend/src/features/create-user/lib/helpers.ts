import { FormState } from '../model/state.types';

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
    last_native_name: '',
    date_birth: '',
    manager_id: '',
    visas: [],
  },
  isSubmitting: false,
  errors: {},
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
