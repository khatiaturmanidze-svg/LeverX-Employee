import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import SignInForm from './SignInForm';
import { getErrorMessageMock, navigateMock, signInMock } from './test-mocks';

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../../authApi', () => ({
  useSignInMutation: () => [signInMock, { isLoading: false }],
}));
vi.mock('@shared/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/lib')>();
  const { getErrorMessageMock } = await import('./test-mocks');

  return {
    ...actual,
    getErrorMessage: getErrorMessageMock,
  };
});

describe('SignInForm', () => {
  const setInputValue = (input: HTMLInputElement, value: string) => {
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

  it('submits trimmed email and stores result in sessionStorage by default', async () => {
    signInMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ token: 'abc', mustChangePassword: false }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignInForm));
    });

    const emailInput = container.querySelector(
      '.signin__form-email',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      '.signin__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(emailInput, '  user@example.com  ');
      setInputValue(passwordInput, 'secret');
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(signInMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(sessionStorage.getItem('loggedInUser')).toBe('user@example.com');
    expect(sessionStorage.getItem('result')).toBe(
      JSON.stringify({ token: 'abc', mustChangePassword: false }),
    );
    expect(localStorage.getItem('loggedInUser')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/main', { replace: true });

    await act(async () => {
      root.unmount();
    });
  });

  it('stores sign-in state in localStorage when remember-me is checked', async () => {
    signInMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ token: 'remember-token', mustChangePassword: false }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignInForm));
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

    expect(localStorage.getItem('loggedInUser')).toBe('remember@site.com');
    expect(localStorage.getItem('result')).toBe(
      JSON.stringify({ token: 'remember-token', mustChangePassword: false }),
    );
    expect(sessionStorage.getItem('loggedInUser')).toBeNull();

    await act(async () => {
      root.unmount();
    });
  });

  it('redirects to new-password when password change is required', async () => {
    signInMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ token: 'temp-token', mustChangePassword: true }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignInForm));
    });

    const emailInput = container.querySelector(
      '.signin__form-email',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      '.signin__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(emailInput, 'temp@site.com');
      setInputValue(passwordInput, 'temp-pass');
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(navigateMock).toHaveBeenCalledWith('/new-password', {
      replace: true,
    });

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
      root.render(React.createElement(SignInForm));
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
