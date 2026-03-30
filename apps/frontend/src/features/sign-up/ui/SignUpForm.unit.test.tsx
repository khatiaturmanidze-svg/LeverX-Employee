import { beforeEach, describe, expect, it, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SignUpForm from './SignUpForm';

const { signUpMock, navigateMock, getErrorMessageMock } = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  navigateMock: vi.fn(),
  getErrorMessageMock: vi.fn(() => 'Sign up failed'),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../../authApi', () => ({
  useSignUpMutation: () => [signUpMock],
}));

vi.mock('@shared/lib', () => ({
  getErrorMessage: getErrorMessageMock,
}));

describe('SignUpForm', () => {
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
    signUpMock.mockReset();
    navigateMock.mockReset();
    getErrorMessageMock.mockClear();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('submits expected payload and stores employee in sessionStorage by default', async () => {
    signUpMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          employee: { id: '1', first_name: 'John', last_name: 'Doe' },
        }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignUpForm));
    });

    const firstNameInput = container.querySelector(
      '.signup__form-first',
    ) as HTMLInputElement;
    const lastNameInput = container.querySelector(
      '.signup__form-last',
    ) as HTMLInputElement;
    const emailInput = container.querySelector(
      '.signup__form-email',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      '.signup__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(firstNameInput, 'John');
      setInputValue(lastNameInput, 'Doe');
      setInputValue(emailInput, '  user@example.com  ');
      setInputValue(passwordInput, 'secret');
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(signUpMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
      first_name: 'John',
      last_name: 'Doe',
    });
    expect(sessionStorage.getItem('loggedInUser')).toBe('user@example.com');
    expect(sessionStorage.getItem('result')).toBe(
      JSON.stringify({ id: '1', first_name: 'John', last_name: 'Doe' }),
    );
    expect(localStorage.getItem('loggedInUser')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/main', { replace: true });

    await act(async () => {
      root.unmount();
    });
  });

  it('stores signup state in localStorage when remember-me is checked', async () => {
    signUpMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          employee: { id: '2', first_name: 'Alice', last_name: 'Smith' },
        }),
    });

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignUpForm));
    });

    const firstNameInput = container.querySelector(
      '.signup__form-first',
    ) as HTMLInputElement;
    const lastNameInput = container.querySelector(
      '.signup__form-last',
    ) as HTMLInputElement;
    const emailInput = container.querySelector(
      '.signup__form-email',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      '.signup__form-password',
    ) as HTMLInputElement;
    const rememberInput = container.querySelector(
      '#signup__remember-me',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(firstNameInput, 'Alice');
      setInputValue(lastNameInput, 'Smith');
      setInputValue(emailInput, 'alice@site.com');
      setInputValue(passwordInput, 'pass');
      rememberInput.click();
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    expect(localStorage.getItem('loggedInUser')).toBe('alice@site.com');
    expect(localStorage.getItem('result')).toBe(
      JSON.stringify({ id: '2', first_name: 'Alice', last_name: 'Smith' }),
    );
    expect(sessionStorage.getItem('loggedInUser')).toBeNull();

    await act(async () => {
      root.unmount();
    });
  });

  it('renders error message when signup request fails', async () => {
    const error = new Error('request failed');
    signUpMock.mockReturnValue({
      unwrap: () => Promise.reject(error),
    });
    getErrorMessageMock.mockReturnValue('Email already used');

    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignUpForm));
    });

    const firstNameInput = container.querySelector(
      '.signup__form-first',
    ) as HTMLInputElement;
    const lastNameInput = container.querySelector(
      '.signup__form-last',
    ) as HTMLInputElement;
    const emailInput = container.querySelector(
      '.signup__form-email',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      '.signup__form-password',
    ) as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    await act(async () => {
      setInputValue(firstNameInput, 'User');
      setInputValue(lastNameInput, 'Test');
      setInputValue(emailInput, 'user@example.com');
      setInputValue(passwordInput, 'pw');
    });

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });

    const errorNode = container.querySelector('.signup__form-error');
    expect(getErrorMessageMock).toHaveBeenCalledWith(error);
    expect(errorNode?.textContent).toBe('Email already used');
    expect(navigateMock).not.toHaveBeenCalled();

    await act(async () => {
      root.unmount();
    });
  });
});
