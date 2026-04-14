import { configureStore } from '@reduxjs/toolkit';
import { usersApi } from '../features/usersApi';
import { authApi } from '../features/authApi';
import { requestsApi } from '../features/requests/api/RequestsApi';

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [requestsApi.reducerPath]: requestsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApi.middleware,
      authApi.middleware,
      requestsApi.middleware,
    ),
});
