import { sessionBaseQuery } from '../shared/lib/sessionBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';
import { IEmployee, EmployeeUpdate } from '../types/type';
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: sessionBaseQuery,
  tagTypes: ['users'],
  endpoints: (builder) => ({
    getUsers: builder.query<IEmployee[], void>({
      query: () => ({
        url: '/users',
      }),
      providesTags: ['users'],
    }),

    getEmployeeDetails: builder.query<IEmployee, string>({
      query: (id) => ({
        url: `/users/${id}`,
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
          'Content-Type': 'application/json',
        },
        body: update,
      }),
      invalidatesTags: (result, error, { id }) => [
        'users',
        { type: 'users', id },
      ],
    }),

    updateEmployeeRole: builder.mutation<
      IEmployee,
      { id: string; newRole: string }
    >({
      query: ({ id, newRole }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        headers: {
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
