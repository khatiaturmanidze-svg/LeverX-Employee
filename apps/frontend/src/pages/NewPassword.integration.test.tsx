import React from 'react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';

import NewPassword from './NewPassword';
import {
  getErrorMessageMock,
  navigateMock,
  setNewPasswordMock,
} from './test-mocks';

vi.mock(
  '@shared/ui',
  async () => (await import('./test-mocks')).authPagesSharedUiModule,
);

vi.mock(
  'react-router-dom',
  async () => (await import('./test-mocks')).authPagesRouterModule,
);

vi.mock(
  '../features/authApi',
  async () => (await import('./test-mocks')).newPasswordPageAuthApiModule,
);

vi.mock(
  '@shared/lib',
  async () => (await import('./test-mocks')).authPagesSharedLibModule,
);

describe('pages/NewPassword (integration)', () => {
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
    setNewPasswordMock.mockReset();
    navigateMock.mockReset();
    getErrorMessageMock.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('submits stored localStorage email, updates auth result, and redirects to main', async () => {
    localStorage.setItem('loggedInUser', 'user@example.com');
    localStorage.setItem(
      'result',
      JSON.stringify({ token: 'abc', mustChangePassword: true }),
    );
    setNewPasswordMock.mockReturnValue({
      unwrap: () => Promise.resolve({ message: 'Password updated' }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(NewPassword));
    });

    const passwordInput = container.querySelector(
      '.signin__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(passwordInput, 'better-password');
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(setNewPasswordMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      newPassword: 'better-password',
    });
    expect(localStorage.getItem('result')).toBe(
      JSON.stringify({ token: 'abc', mustChangePassword: false }),
    );
    expect(navigateMock).toHaveBeenCalledWith('/main', { replace: true });

    await act(async () => {
      root.unmount();
    });
  });

  it('uses sessionStorage when localStorage is empty', async () => {
    sessionStorage.setItem('loggedInUser', 'session@example.com');
    sessionStorage.setItem(
      'result',
      JSON.stringify({ token: 'session-token', mustChangePassword: true }),
    );
    setNewPasswordMock.mockReturnValue({
      unwrap: () => Promise.resolve({ message: 'Password updated' }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(NewPassword));
    });

    const passwordInput = container.querySelector(
      '.signin__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(passwordInput, 'session-password');
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(setNewPasswordMock).toHaveBeenCalledWith({
      email: 'session@example.com',
      newPassword: 'session-password',
    });
    expect(sessionStorage.getItem('result')).toBe(
      JSON.stringify({ token: 'session-token', mustChangePassword: false }),
    );

    await act(async () => {
      root.unmount();
    });
  });

  it('redirects to sign-in when there is no stored email', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(NewPassword));
    });

    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(setNewPasswordMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/signin', { replace: true });

    await act(async () => {
      root.unmount();
    });
  });

  it('renders an error message when the password update fails', async () => {
    localStorage.setItem('loggedInUser', 'user@example.com');
    const error = new Error('request failed');
    setNewPasswordMock.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });
    getErrorMessageMock.mockReturnValue('Could not update password');

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(NewPassword));
    });

    const passwordInput = container.querySelector(
      '.signin__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(passwordInput, 'bad-password');
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    const errorNode = container.querySelector('.signin__error');
    expect(getErrorMessageMock).toHaveBeenCalledWith(error);
    expect(errorNode?.textContent).toBe('Could not update password');
    expect(navigateMock).not.toHaveBeenCalled();

    await act(async () => {
      root.unmount();
    });
  });
});
