import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { IEmployee, IDateOfBirth, IRequestData } from '../types/type';

// getting logged in user
export const getLoggedInUser = (users: IEmployee[]): IEmployee | undefined => {
  const loggedEmail =
    localStorage.getItem('loggedInUser') ||
    sessionStorage.getItem('loggedInUser');
  return users.find((u) => u.email === loggedEmail);
};

export const getUserById = (
  users: IEmployee[],
  id: string,
): IEmployee | undefined => {
  return users.find((u) => u._id === id);
};

export function canEdit(
  loggedIn: IEmployee | undefined,
  target: IEmployee,
): boolean {
  if (!loggedIn) return false;

  return loggedIn.role === 'Admin' || loggedIn._id === target.manager?.id;
}

export function formatDateOfBirth(
  date: IDateOfBirth | null | undefined,
): string {
  if (!date) return 'no date';
  if (!date.year || !date.month || !date.day) {
    return 'date of birth not set';
  }
  const dat = new Date(date.year, date.month - 1, date.day);
  return dat.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getErrorMessage(err: unknown): string {
  // RTK  error
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const error = err as FetchBaseQueryError;
    // Backend sent plain string
    if (typeof error.data === 'string') {
      return error.data;
    }
    // Backend sent structured object
    if (typeof error.data === 'object' && error.data !== null) {
      if ('message' in error.data) return String(error.data.message);
      if ('error' in error.data) return String(error.data.error);
      if ('details' in error.data) return String(error.data.details);
    }
    // HTTP status based
    if (typeof error.status === 'number') {
      if (error.status === 401) return 'Invalid email or password';
      if (error.status === 403) return 'You are not authorized';
      if (error.status === 404) return 'Resource not found';
      if (error.status >= 500) return 'Server error, try again later';
    }
  }

  if (err instanceof Error) {
    return err.message;
  }
  return 'Something went wrong';
}

export function getDisplayStatus(req: IRequestData) {
  if (req.status === 'pending') return 'pending';
  if (req.status === 'rejected') return 'rejected';

  const today = new Date().getTime();
  const start = new Date(req.start_date).getTime();
  const end = new Date(req.end_date).getTime();

  if (today >= start && today <= end) return 'Active';
  if (today < start) return 'Approved (Upcoming)';

  return 'Completed';
}

export const getManagedEmployees = (users: IEmployee[]): IEmployee[] => {
  const currentUser = getLoggedInUser(users);
  if (!currentUser) return [];
  return users.filter((u) => u.manager?.id === currentUser._id);
};

export function validateRequest(data: IRequestData) {
  const errors: Record<string, string> = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(data.start_date);
  const end = new Date(data.end_date);

  if (!data.start_date) {
    errors.start_date = 'Start date is required';
  } else if (start < today) {
    errors.start_date = 'Start date cannot be in the past';
  }

  if (!data.end_date) {
    errors.end_date = 'End date is required';
  } else if (end < start) {
    errors.end_date = 'End date must be after start date';
  }

  return errors;
}
