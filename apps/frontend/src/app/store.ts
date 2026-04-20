import { configureStore } from '@reduxjs/toolkit';
import { createUserApi } from '../features/create-user/api/createUserApi';
import { usersApi } from '../features/usersApi';
import { authApi } from '../features/authApi';
import { requestsApi } from '../features/requests/api/RequestsApi';

export const store = configureStore({
  reducer: {
    [createUserApi.reducerPath]: createUserApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [requestsApi.reducerPath]: requestsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      createUserApi.middleware,
      usersApi.middleware,
      authApi.middleware,
      requestsApi.middleware,
    ),
});
