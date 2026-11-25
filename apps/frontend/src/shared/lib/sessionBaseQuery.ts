import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type BaseQueryApi,
} from '@reduxjs/toolkit/query/react';
import {
  sessionActions,
  type SessionAccount,
  type SessionState,
} from '../../app/sessionSlice';

const rawQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  // Bypass stale redirects and cached responses when checking session data.
  cache: 'no-store',
});
const csrfRequests = new WeakMap<BaseQueryApi['dispatch'], Promise<void>>();
const getSession = (api: BaseQueryApi) =>
  (api.getState() as { session: SessionState }).session;

async function ensureCsrf(api: BaseQueryApi, extra: object) {
  if (getSession(api)?.csrfToken) return;
  let pending = csrfRequests.get(api.dispatch);
  if (!pending) {
    pending = (async () => {
      const result = await rawQuery('/csrf', api, extra);
      if (result.error) throw result.error;
      api.dispatch(
        sessionActions.csrfReceived(
          result.data as { csrfToken: string; allowPublicSignup: boolean },
        ),
      );
    })();
    csrfRequests.set(api.dispatch, pending);
  }
  try {
    await pending;
  } finally {
    if (csrfRequests.get(api.dispatch) === pending)
      csrfRequests.delete(api.dispatch);
  }
}

export const sessionBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  const request: FetchArgs =
    typeof args === 'string' ? { url: args } : { ...args };
  const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(
    (request.method ?? 'GET').toUpperCase(),
  );
  if (unsafe) {
    try {
      await ensureCsrf(api, extra);
    } catch (error) {
      return { error: error as FetchBaseQueryError };
    }
    const headers = new Headers();
    if (request.headers instanceof Headers)
      request.headers.forEach((value, key) => headers.set(key, value));
    else if (Array.isArray(request.headers)) {
      for (const [key, value] of request.headers) headers.set(key, value);
    } else {
      for (const [key, value] of Object.entries(request.headers ?? {}))
        if (value !== undefined) headers.set(key, value);
    }
    headers.set('X-CSRF-Token', getSession(api).csrfToken!);
    request.headers = headers;
  }
  const result = await rawQuery(request, api, extra);
  if (result.data && request.url === '/csrf') {
    api.dispatch(
      sessionActions.csrfReceived(
        result.data as { csrfToken: string; allowPublicSignup: boolean },
      ),
    );
  }
  if (result.data && request.url === '/me') {
    api.dispatch(sessionActions.accountReceived(result.data as SessionAccount));
  }
  const code =
    result.error?.data &&
    typeof result.error.data === 'object' &&
    'code' in result.error.data
      ? result.error.data.code
      : undefined;
  if (
    (result.error?.status === 401 &&
      !['/sign-in', '/sign-up'].includes(request.url)) ||
    [
      'PASSWORD_CHANGED_SIGN_IN_REQUIRED',
      'ACCOUNT_CREATED_SIGN_IN_REQUIRED',
      'SESSION_RESTART_REQUIRED',
    ].includes(String(code))
  ) {
    api.dispatch(sessionActions.anonymous());
  }
  if (code === 'PASSWORD_CHANGE_REQUIRED')
    api.dispatch(sessionActions.passwordRequired());
  if (result.error?.status === 403) {
    // Refresh status and token for the next deliberate user action. Never replay
    // an arbitrary mutation, upload, or failed login automatically.
    const me = await rawQuery('/me', api, extra);
    if (me.data)
      api.dispatch(sessionActions.accountReceived(me.data as SessionAccount));
    else if (me.error?.status === 401) api.dispatch(sessionActions.anonymous());
    if (code === 'CSRF_FAILED') {
      const csrf = await rawQuery('/csrf', api, extra);
      if (csrf.data)
        api.dispatch(
          sessionActions.csrfReceived(csrf.data as { csrfToken: string }),
        );
    }
  }
  return result;
};
