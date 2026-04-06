import React from 'react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';

import SignUp from './SignUp';

const { signUpFormPropsMock } = vi.hoisted(() => ({
  signUpFormPropsMock: vi.fn(),
}));

vi.mock('@shared/ui', () => ({
  SignHeader: () =>
    React.createElement('div', { 'data-testid': 'sign-header' }, 'header'),

  SignMain: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'sign-main' }, children),
}));

vi.mock('@features/sign-up', () => ({
  SignUpForm: (props: Record<string, never>) => {
    signUpFormPropsMock(props);
    return React.createElement(
      'div',
      { 'data-testid': 'sign-up-form' },
      'form',
    );
  },
}));

describe('pages/SignUp (integration)', () => {
  beforeEach(() => {
    signUpFormPropsMock.mockReset();
  });

  it('renders the sign up layout with SignUpForm inside SignMain', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignUp));
    });

    expect(container.querySelector('[data-testid="sign-header"]')).toBeTruthy();
    const main = container.querySelector('[data-testid="sign-main"]');
    const form = container.querySelector('[data-testid="sign-up-form"]');

    expect(main).toBeTruthy();
    expect(form).toBeTruthy();
    expect(main?.contains(form as Node)).toBe(true);
    expect(signUpFormPropsMock).toHaveBeenCalledWith({});

    await act(async () => {
      root.unmount();
    });
  });
});
