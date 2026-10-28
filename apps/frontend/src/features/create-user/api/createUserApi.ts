import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  CreateUserPayload,
  CreateUserResponse,
  UploadSpreadsheetResponse,
} from '@/types/type';
import { usersApi } from '../../usersApi';

const DUMMY_TOKEN = import.meta.env.VITE_AUTH_TOKEN || 'authorized-can-access';
const BASE_URL = '/api';

export const createUserApi = createApi({
  reducerPath: 'createUserApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    addUser: builder.mutation<CreateUserResponse, CreateUserPayload>({
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(usersApi.util.invalidateTags(['users']));
        } catch {
          // A rejected creation does not change the employee list.
        }
      },
      query: (body) => ({
        url: '/users',
        method: 'POST',
        headers: {
          Authorization: DUMMY_TOKEN,
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
    uploadSpreadsheet: builder.mutation<UploadSpreadsheetResponse, File>({
      async onQueryStarted(_file, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // A partial upload can also have committed employee records.
          dispatch(usersApi.util.invalidateTags(['users']));
        } catch {
          // A rejected upload has no successful result to refresh from.
        }
      },
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
    }),
  }),
});

export const { useAddUserMutation, useUploadSpreadsheetMutation } =
  createUserApi;
