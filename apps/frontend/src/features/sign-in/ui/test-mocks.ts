import { vi } from 'vitest';

export const signInMock = vi.fn();
export const navigateMock = vi.fn();
export const getErrorMessageMock = vi.fn(() => 'Sign in failed');
