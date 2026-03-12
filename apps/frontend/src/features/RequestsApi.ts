import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IRequestData } from '../types/type';
const BASE_URL = 'http://localhost:3000';
const DUMMY_TOKEN = 'authorized-can-access';

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
      providesTags: ['requests'],
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
      invalidatesTags: ['requests'],
    }),
  }),
});

export const { useGetRequestsQuery, useAddRequestMutation } = requestsApi;
