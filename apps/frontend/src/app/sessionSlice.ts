import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SessionAccount {
  userId: string;
  role: string;
  mustChangePassword: boolean;
}
export interface SessionState {
  status: 'checking' | 'authenticated' | 'anonymous' | 'error';
  account: SessionAccount | null;
  csrfToken: string | null;
  ready: boolean;
  error: string | null;
  allowPublicSignup: boolean;
}
export const initialSessionState: SessionState = {
  status: 'checking',
  account: null,
  csrfToken: null,
  ready: false,
  error: null,
  allowPublicSignup: false,
};
const slice = createSlice({
  name: 'session',
  initialState: initialSessionState,
  reducers: {
    checking(state) {
      state.status = 'checking';
      state.ready = false;
      state.error = null;
    },
    accountReceived(state, action: PayloadAction<SessionAccount>) {
      state.account = action.payload;
      state.status = 'authenticated';
      state.error = null;
    },
    anonymous(state) {
      state.account = null;
      state.status = 'anonymous';
      state.csrfToken = null;
      state.error = null;
    },
    csrfReceived(
      state,
      action: PayloadAction<{ csrfToken: string; allowPublicSignup?: boolean }>,
    ) {
      state.csrfToken = action.payload.csrfToken;
      if (action.payload.allowPublicSignup !== undefined)
        state.allowPublicSignup = action.payload.allowPublicSignup;
    },
    ready(state) {
      state.ready = true;
    },
    failed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
      state.ready = true;
    },
    passwordRequired(state) {
      if (state.account) state.account.mustChangePassword = true;
    },
    clearCaches() {
      /* The store listener resets every account-specific API slice. */
    },
  },
});
export const sessionActions = slice.actions;
export const sessionReducer = slice.reducer;
export const selectSession = (state: { session: SessionState }) =>
  state.session;
