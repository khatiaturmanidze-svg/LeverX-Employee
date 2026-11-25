import { configureStore } from '@reduxjs/toolkit';
import { createUserApi } from '../features/create-user/api/createUserApi';
import { usersApi } from '../features/usersApi';
import { authApi } from '../features/authApi';
import { requestsApi } from '../features/requests/api/RequestsApi';
import { sessionReducer } from './sessionSlice';
import { createSessionCacheListener } from './sessionCache';

export function createAppStore() {
  const sessionCache = createSessionCacheListener();
  return configureStore({
    reducer: {
      session: sessionReducer,
      [createUserApi.reducerPath]: createUserApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [requestsApi.reducerPath]: requestsApi.reducer,
    },
    middleware: (defaults) =>
      defaults()
        .prepend(sessionCache.middleware)
        .concat(
          createUserApi.middleware,
          usersApi.middleware,
          authApi.middleware,
          requestsApi.middleware,
        ),
  });
}
export const store = createAppStore();
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
