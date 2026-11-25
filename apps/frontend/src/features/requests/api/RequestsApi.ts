import { sessionBaseQuery } from '../../../shared/lib/sessionBaseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

import { IRequestData } from '../model/state.types';

export const requestsApi = createApi({
  reducerPath: 'requestsApi',
  baseQuery: sessionBaseQuery,
  tagTypes: ['requests'],
  endpoints: (builder) => ({
    getRequests: builder.query<IRequestData[], string | undefined>({
      query: (id) => ({
        url: `/requests/${id}`,
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
