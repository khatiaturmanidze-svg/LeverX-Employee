import { configureStore } from '@reduxjs/toolkit';
import { usersApi } from '../features/usersApi';
import { authApi } from '../features/authApi';

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(usersApi.middleware, authApi.middleware),
});
