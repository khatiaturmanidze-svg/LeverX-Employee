import { vi } from 'vitest';

export const signUpMock = vi.fn();
export const navigateMock = vi.fn();
export const getErrorMessageMock = vi.fn(() => 'Sign up failed');
