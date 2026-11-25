import { authApi } from '../features/authApi';
import { sessionActions } from './sessionSlice';
import { clearLegacyAuthStorage } from '../shared/lib/authStorage';
import type { AppDispatch, RootState } from './store';

const running = new WeakMap<AppDispatch, Promise<void>>();

export const bootstrapSession =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const previous = running.get(dispatch);
    if (previous) return previous;
    const pending = (async () => {
      clearLegacyAuthStorage();
      dispatch(sessionActions.checking());
      try {
        const me = dispatch(
          authApi.endpoints.getMe.initiate(undefined, {
            forceRefetch: true,
            subscribe: false,
          }),
        );
        const result = await me;
        if (
          result.error &&
          (!('status' in result.error) || result.error.status !== 401)
        )
          throw new Error('We could not check your session. Please try again.');
        const csrf = dispatch(
          authApi.endpoints.getCsrfToken.initiate(undefined, {
            forceRefetch: true,
            subscribe: false,
          }),
        );
        await csrf.unwrap();
        // A 401 is confirmed anonymous; service failures never imply logout.
        if (getState().session.status !== 'error')
          dispatch(sessionActions.ready());
      } catch {
        dispatch(
          sessionActions.failed(
            'We could not check your session. Please try again.',
          ),
        );
      }
    })();
    running.set(dispatch, pending);
    void pending.finally(() => running.delete(dispatch));
    return pending;
  };
