import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IEmployee } from '../types/type';
import { usersApi } from './usersApi';
import { getStoredAuth } from '@shared/lib/authStorage';

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

interface signUpResponse extends signInResponse {
  message: string;
  employee: IEmployee;
}

const BASE_URL = '/api';
const FALLBACK_TOKEN =
  import.meta.env.VITE_AUTH_TOKEN || 'authorized-can-access';

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
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const auth = getStoredAuth();
        if (auth?.error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: auth.error.message,
              data: { error: auth.error.message },
            },
          };
        }

        const response = await baseQuery({
          url: '/set-new-password',
          method: 'POST',
          headers: {
            Authorization: auth?.authData?.token || FALLBACK_TOKEN,
            'Content-Type': 'application/json',
          },
          body,
        });
        if (response.error) return { error: response.error };
        return { data: response.data as setNewPasswordResponse };
      },
    }),

    signUp: builder.mutation<signUpResponse, SignUpPayload>({
      async queryFn(body, { dispatch }, _extraOptions, baseQuery) {
        const response = await baseQuery({
          url: '/sign-up',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        });
        if (response.error) return { error: response.error };

        dispatch(usersApi.util.invalidateTags(['users']));
        return { data: response.data as signUpResponse };
      },
    }),
  }),
});

export const {
  useSignInMutation,
  useSetNewPasswordMutation,
  useSignUpMutation,
} = authApi;
