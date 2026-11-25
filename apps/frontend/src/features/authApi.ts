import { createApi } from '@reduxjs/toolkit/query/react';
import type { IEmployee } from '../types/type';
import { sessionBaseQuery } from '../shared/lib/sessionBaseQuery';
import { sessionActions, type SessionAccount } from '../app/sessionSlice';

interface SignInPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}
interface SignUpPayload extends SignInPayload {
  first_name: string;
  last_name: string;
}
export interface SignInResponse {
  message: string;
  userId: string;
  mustChangePassword: boolean;
  csrfToken: string;
}
interface SignUpResponse extends SignInResponse {
  employee: IEmployee;
}
interface PasswordResponse {
  message: string;
  csrfToken: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: sessionBaseQuery,
  endpoints: (builder) => ({
    getMe: builder.query<SessionAccount, void>({ query: () => '/me' }),
    getCsrfToken: builder.query<
      { csrfToken: string; allowPublicSignup: boolean },
      void
    >({ query: () => '/csrf' }),
    signIn: builder.mutation<SignInResponse, SignInPayload>({
      async queryFn(body, api, _extra, baseQuery) {
        const result = await baseQuery({
          url: '/sign-in',
          method: 'POST',
          body,
        });
        if (result.error) return { error: result.error };
        const data = result.data as SignInResponse;
        api.dispatch(sessionActions.csrfReceived(data));
        const me = await baseQuery('/me');
        if (me.error) return { error: me.error };
        api.dispatch(sessionActions.clearCaches());
        return { data };
      },
    }),
    signUp: builder.mutation<SignUpResponse, SignUpPayload>({
      async queryFn(body, api, _extra, baseQuery) {
        const result = await baseQuery({
          url: '/sign-up',
          method: 'POST',
          body,
        });
        if (result.error) return { error: result.error };
        const data = result.data as SignUpResponse;
        api.dispatch(sessionActions.csrfReceived(data));
        const me = await baseQuery('/me');
        if (me.error) return { error: me.error };
        api.dispatch(sessionActions.clearCaches());
        return { data };
      },
    }),
    setNewPassword: builder.mutation<PasswordResponse, { newPassword: string }>(
      {
        async queryFn(body, api, _extra, baseQuery) {
          const result = await baseQuery({
            url: '/set-new-password',
            method: 'POST',
            body,
          });
          if (result.error) return { error: result.error };
          const data = result.data as PasswordResponse;
          api.dispatch(sessionActions.csrfReceived(data));
          const me = await baseQuery('/me');
          if (me.error) return { error: me.error };
          api.dispatch(sessionActions.clearCaches());
          return { data };
        },
      },
    ),
    signOut: builder.mutation<void, void>({
      async queryFn(_body, api, _extra, baseQuery) {
        const result = await baseQuery({ url: '/sign-out', method: 'POST' });
        if (result.error) return { error: result.error };
        api.dispatch(sessionActions.anonymous());
        api.dispatch(sessionActions.clearCaches());
        return { data: undefined };
      },
    }),
  }),
});
export const {
  useSignInMutation,
  useSignUpMutation,
  useSetNewPasswordMutation,
  useGetMeQuery,
  useGetCsrfTokenQuery,
  useSignOutMutation,
} = authApi;
