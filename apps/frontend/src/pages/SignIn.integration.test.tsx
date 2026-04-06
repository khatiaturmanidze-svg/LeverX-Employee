import React from 'react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';

import SignIn from './SignIn';

const { signInFormPropsMock } = vi.hoisted(() => ({
  signInFormPropsMock: vi.fn(),
}));

vi.mock('@shared/ui', () => ({
  SignHeader: () =>
    React.createElement('div', { 'data-testid': 'sign-header' }, 'header'),

  SignMain: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'sign-main' }, children),
}));

vi.mock('@features/sign-in', () => ({
  SignInForm: (props: Record<string, never>) => {
    signInFormPropsMock(props);
    return React.createElement(
      'div',
      { 'data-testid': 'sign-in-form' },
      'form',
    );
  },
}));

describe('pages/SignIn (integration)', () => {
  beforeEach(() => {
    signInFormPropsMock.mockReset();
  });

  it('renders the sign in layout with SignInForm inside SignMain', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(SignIn));
    });

    expect(container.querySelector('[data-testid="sign-header"]')).toBeTruthy();
    const main = container.querySelector('[data-testid="sign-main"]');
    const form = container.querySelector('[data-testid="sign-in-form"]');

    expect(main).toBeTruthy();
    expect(form).toBeTruthy();
    expect(main?.contains(form as Node)).toBe(true);
    expect(signInFormPropsMock).toHaveBeenCalledWith({});

    await act(async () => {
      root.unmount();
    });
  });
});
