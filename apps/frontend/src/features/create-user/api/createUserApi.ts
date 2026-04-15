import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  CreateUserPayload,
  CreateUserResponse,
  UploadSpreadsheetResponse,
} from '@/types/type';

const DUMMY_TOKEN = import.meta.env.VITE_AUTH_TOKEN || 'authorized-can-access';
const BASE_URL = '/api';

export const createUserApi = createApi({
  reducerPath: 'createUserApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['users'],
  endpoints: (builder) => ({
    addUser: builder.mutation<CreateUserResponse, CreateUserPayload>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        headers: {
          Authorization: DUMMY_TOKEN,
          'Content-Type': 'application/json',
        },
        body,
      }),
      invalidatesTags: ['users'],
    }),
    uploadSpreadsheet: builder.mutation<UploadSpreadsheetResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: '/users/upload',
          method: 'POST',
          headers: {
            Authorization: DUMMY_TOKEN,
          },
          body: formData,
        };
      },
      invalidatesTags: ['users'],
    }),
  }),
});

export const { useAddUserMutation, useUploadSpreadsheetMutation } =
  createUserApi;
