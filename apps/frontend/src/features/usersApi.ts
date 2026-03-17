import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IEmployee, EmployeeUpdate } from '../types/type';
const DUMMY_TOKEN = 'authorized-can-access';
const BASE_URL = '/api';
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['users'],
  endpoints: (builder) => ({
    getUsers: builder.query<IEmployee[], void>({
      query: () => ({
        url: '/users',
        headers: { Authorization: DUMMY_TOKEN },
      }),
      providesTags: ['users'],
    }),

    getEmployeeDetails: builder.query<IEmployee, string>({
      query: (id) => ({
        url: `/users/${id}`,
        headers: { Authorization: DUMMY_TOKEN },
      }),
      providesTags: (result, error, id) => [{ type: 'users', id }],
    }),

    updateEmployee: builder.mutation<
      IEmployee,
      { id: string; update: EmployeeUpdate }
    >({
      query: ({ id, update }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        headers: {
          Authorization: DUMMY_TOKEN,
          'Content-Type': 'application/json',
        },
        body: update,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'users', id }],
    }),

    updateEmployeeRole: builder.mutation<
      IEmployee,
      { id: string; newRole: string }
    >({
      query: ({ id, newRole }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        headers: {
          Authorization: DUMMY_TOKEN,
          'Content-Type': 'application/json',
        },
        body: { newRole },
      }),
      invalidatesTags: ['users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetEmployeeDetailsQuery,
  useUpdateEmployeeMutation,
  useUpdateEmployeeRoleMutation,
} = usersApi;
