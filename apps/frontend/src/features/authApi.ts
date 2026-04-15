import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IEmployee } from '../types/type';

interface SignInPayload {
  email: string;
  password: string;
}

interface SetNewPasswordPayload {
  email: string;
  newPassword: string;
}

interface SignUpPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface signInResponse {
  token: string;
  userId: string;
  mustChangePassword: boolean;
}

interface setNewPasswordResponse {
  message: string;
}

interface signUpResponse {
  message: string;
  employee: IEmployee;
}

const BASE_URL = '/api';
const FALLBACK_TOKEN =
  import.meta.env.VITE_AUTH_TOKEN || 'authorized-can-access';

function getStoredAuthToken(): string {
  const storedResult =
    localStorage.getItem('result') ?? sessionStorage.getItem('result');

  if (!storedResult) {
    return FALLBACK_TOKEN;
  }

  try {
    const parsed = JSON.parse(storedResult) as Partial<signInResponse>;
    return parsed.token || FALLBACK_TOKEN;
  } catch {
    return FALLBACK_TOKEN;
  }
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    signIn: builder.mutation<signInResponse, SignInPayload>({
      query: (body) => ({
        url: '/sign-in',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
    setNewPassword: builder.mutation<
      setNewPasswordResponse,
      SetNewPasswordPayload
    >({
      query: (body) => ({
        url: '/set-new-password',
        method: 'POST',
        headers: {
          Authorization: getStoredAuthToken(),
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),

    signUp: builder.mutation<signUpResponse, SignUpPayload>({
      query: (body) => ({
        url: '/sign-up',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
  }),
});

export const {
  useSignInMutation,
  useSetNewPasswordMutation,
  useSignUpMutation,
} = authApi;
