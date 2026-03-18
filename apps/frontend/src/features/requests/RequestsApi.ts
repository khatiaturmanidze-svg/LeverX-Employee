import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { IRequestData } from './requestForm/state.types';

const DUMMY_TOKEN = import.meta.env.VITE_AUTH_TOKEN;
const BASE_URL = '/api';

export const requestsApi = createApi({
  reducerPath: 'requestsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['requests'],
  endpoints: (builder) => ({
    getRequests: builder.query<IRequestData[], string | undefined>({
      query: (id) => ({
        url: `/requests/${id}`,
        headers: { Authorization: DUMMY_TOKEN },
      }),
      providesTags: (result, error, id) => [{ type: 'requests', id }],
    }),
    addRequest: builder.mutation<
      IRequestData,
      { employeeId: string; body: Omit<IRequestData, 'id'> }
    >({
      query: ({ employeeId, body }) => ({
        url: `/requests/${employeeId}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
      invalidatesTags: (result, error, { employeeId }) => [
        { type: 'requests', id: employeeId },
      ],
    }),
    updateRequest: builder.mutation<
      IRequestData,
      { employeeId: string; requestId: string; newStatus: string }
    >({
      query: ({ employeeId, requestId, newStatus }) => ({
        url: `/requests/${employeeId}`,
        method: 'PUT',
        headers: { Authorization: DUMMY_TOKEN },
        body: { requestId, newStatus },
      }),
      invalidatesTags: (result, error, { employeeId }) => [
        { type: 'requests', id: employeeId },
      ],
    }),
  }),
});

export const {
  useGetRequestsQuery,
  useAddRequestMutation,
  useUpdateRequestMutation,
} = requestsApi;
