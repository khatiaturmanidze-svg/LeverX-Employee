import { createListenerMiddleware } from '@reduxjs/toolkit';
import { authApi } from '../features/authApi';
import { usersApi } from '../features/usersApi';
import { requestsApi } from '../features/requests/api/RequestsApi';
import { createUserApi } from '../features/create-user/api/createUserApi';
import { sessionActions, type SessionState } from './sessionSlice';

export function createSessionCacheListener() {
  const listener = createListenerMiddleware();
  listener.startListening({
    predicate: (action) =>
      sessionActions.accountReceived.match(action) ||
      sessionActions.anonymous.match(action) ||
      sessionActions.clearCaches.match(action),
    effect: async (action, api) => {
      const before = (api.getOriginalState() as { session: SessionState })
        .session.account;
      const after = (api.getState() as { session: SessionState }).session
        .account;
      if (
        before?.userId === after?.userId &&
        before?.role === after?.role &&
        before?.mustChangePassword === after?.mustChangePassword &&
        !sessionActions.clearCaches.match(action)
      )
        return;
      api.cancelActiveListeners();
      // Let the request which established/cleared identity finish settling first.
      await api.delay(0);
      api.dispatch(usersApi.util.resetApiState());
      api.dispatch(requestsApi.util.resetApiState());
      api.dispatch(createUserApi.util.resetApiState());
      api.dispatch(authApi.util.resetApiState());
    },
  });
  return listener;
}
