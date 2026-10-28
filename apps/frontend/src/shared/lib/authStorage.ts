export const AUTH_DATA_KEY = 'authData';
const LEGACY_AUTH_DATA_KEY = 'result';
const LOGGED_IN_USER_KEY = 'loggedInUser';

export interface AuthData {
  token?: string;
  userId?: string;
  mustChangePassword?: boolean;
}

interface StoredAuth {
  email: string;
  authData: AuthData | null;
  storage: Storage;
  error: Error | null;
}

function isAuthData(value: unknown): value is AuthData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    (!('token' in value) || typeof value.token === 'string') &&
    (!('userId' in value) || typeof value.userId === 'string') &&
    (!('mustChangePassword' in value) ||
      typeof value.mustChangePassword === 'boolean')
  );
}

export function getStoredAuth(): StoredAuth | null {
  const localEmail = localStorage.getItem(LOGGED_IN_USER_KEY);
  const sessionEmail = sessionStorage.getItem(LOGGED_IN_USER_KEY);
  const email = localEmail || sessionEmail;
  if (!email) return null;

  const storage = localEmail ? localStorage : sessionStorage;
  const currentData = storage.getItem(AUTH_DATA_KEY);
  const storedData = currentData ?? storage.getItem(LEGACY_AUTH_DATA_KEY);
  let authData: AuthData | null = null;
  let error: Error | null = null;

  if (storedData) {
    try {
      const parsed: unknown = JSON.parse(storedData);
      if (isAuthData(parsed)) {
        authData = parsed;
        if (currentData === null) {
          storage.setItem(AUTH_DATA_KEY, storedData);
          storage.removeItem(LEGACY_AUTH_DATA_KEY);
        }
      } else {
        error = new Error(
          'Your saved sign-in data is invalid. Please sign in again.',
        );
      }
    } catch (cause) {
      error = new Error(
        'Your saved sign-in data could not be loaded. Please sign in again.',
        { cause },
      );
    }
  }

  return { email, authData, storage, error };
}
