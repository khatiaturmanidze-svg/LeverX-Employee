import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IEmployee } from '../types/type';

interface SignInPayload {
  email: string;
  password: string;
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
}

interface signUpResponse {
  message: string;
  employee: IEmployee;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000',
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

export const { useSignInMutation, useSignUpMutation } = authApi;
