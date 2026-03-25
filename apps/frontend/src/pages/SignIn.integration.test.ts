import React from 'react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';

import SignIn from './SignIn';

// ---------------------------------------------------------------------------
// Test strategy
// ---------------------------------------------------------------------------
// We want an "integration-like" test for the *page*:
//   pages/SignIn.tsx -> SignHeader + SignMain + SignInForm
//
// The page includes `SignHeader`, which depends on router APIs (`useLocation`)
// and `Link` from react-router. To keep this test focused on the submit flow,
// we mock `SignHeader` to a tiny stub, while rendering the real SignMain and
// the real SignInForm.
//
// Then we mock:
// - `useSignInMutation` (RTK Query hook) to control `unwrap()` results
// - `useNavigate` (react-router) to assert navigation
// - `getErrorMessage` to make error messages deterministic

const { signInMock, navigateMock, getErrorMessageMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  navigateMock: vi.fn(),
  getErrorMessageMock: vi.fn(() => 'Sign in failed'),
}));

// Mock SignHeader to avoid `useLocation` + `Link` dependencies.
vi.mock('../shared/ui/SignHeader', () => ({
  default: () => React.createElement('div', { 'data-testid': 'sign-header' }),
}));

// Mock navigation.
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

// Mock the RTK Query auth mutation hook.
vi.mock('../features/authApi', () => ({
  useSignInMutation: () => [signInMock],
}));

// Mock error-message mapping so tests are stable.
vi.mock('../shared/lib/core', () => ({
  getErrorMessage: getErrorMessageMock,
}));

describe('pages/SignIn (integration)', () => {
  const setInputValue = (input: HTMLInputElement, value: string) => {
    // jsdom does not always trigger React controlled updates unless we use
    // the native input "value" setter and dispatch an input event.
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    if (!setter) throw new Error('Input value setter not found');
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  beforeEach(() => {
    signInMock.mockReset();
    navigateMock.mockReset();
    getErrorMessageMock.mockClear();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('submits trimmed email and stores token in sessionStorage by default', async () => {
    // Arrange the fake backend response for success.
    signInMock.mockReturnValue({
      unwrap: () => Promise.resolve({ token: 'abc' }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    // Render the *page* (not just the form).
    await act(async () => {
      root.render(React.createElement(SignIn));
    });

    // Grab real DOM nodes from SignInForm.
    const emailInput = container.querySelector(
      '.signin__form-email',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      '.signin__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    // Act: set inputs with whitespace around email to verify trimming.
    await act(async () => {
      setInputValue(emailInput, '  user@example.com  ');
      setInputValue(passwordInput, 'secret');
    });

    // Act: submit the form (triggers onSubmit handler).
    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    // Assert: mutation called with trimmed email + password.
    expect(signInMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
    });

    // Assert storage behavior by default (rememberMe=false -> sessionStorage).
    expect(sessionStorage.getItem('loggedInUser')).toBe('user@example.com');
    expect(sessionStorage.getItem('result')).toBe(
      JSON.stringify({ token: 'abc' }),
    );
    expect(localStorage.getItem('loggedInUser')).toBeNull();

    // Assert navigation after successful submit.
    expect(navigateMock).toHaveBeenCalledWith('/main', { replace: true });

    await act(async () => {
      root.unmount();
    });
  });

  it('stores sign-in state in localStorage when remember-me is checked', async () => {
    signInMock.mockReturnValue({
      unwrap: () => Promise.resolve({ token: 'remember-token' }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignIn));
    });

    const emailInput = container.querySelector(
      '.signin__form-email',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      '.signin__form-password',
    ) as HTMLInputElement;
    const rememberInput = container.querySelector(
      '#signin__remember-me',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(emailInput, 'remember@site.com');
      setInputValue(passwordInput, 'pass');
      rememberInput.click();
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    // rememberMe=true -> localStorage
    expect(localStorage.getItem('loggedInUser')).toBe('remember@site.com');
    expect(localStorage.getItem('result')).toBe(
      JSON.stringify({ token: 'remember-token' }),
    );
    expect(sessionStorage.getItem('loggedInUser')).toBeNull();

    await act(async () => {
      root.unmount();
    });
  });

  it('renders error message when sign-in request fails', async () => {
    const error = new Error('network');
    signInMock.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });
    getErrorMessageMock.mockReturnValue('Bad credentials');

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignIn));
    });

    const emailInput = container.querySelector(
      '.signin__form-email',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      '.signin__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(emailInput, 'user@example.com');
      setInputValue(passwordInput, 'wrong');
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    const errorNode = container.querySelector('.signin__error');
    expect(getErrorMessageMock).toHaveBeenCalledWith(error);
    expect(errorNode?.textContent).toBe('Bad credentials');
    expect(navigateMock).not.toHaveBeenCalled();

    await act(async () => {
      root.unmount();
    });
  });
});
