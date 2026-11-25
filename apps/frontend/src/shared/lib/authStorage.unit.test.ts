import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getStoredAuth } from './authStorage';

describe('getStoredAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ignores auth payloads without an active logged-in user', () => {
    localStorage.setItem('authData', JSON.stringify({ token: 'old-token' }));
    expect(getStoredAuth()).toBeNull();
  });

  it.each(['localStorage', 'sessionStorage'] as const)(
    'reads the email and complete auth payload together from %s',
    (storageName) => {
      const storage = window[storageName];
      const authData = {
        token: 'token',
        userId: 'employee-1',
        mustChangePassword: true,
        employee: { _id: 'employee-1', first_name: 'Test' },
      };
      storage.setItem('loggedInUser', 'test@example.com');
      storage.setItem('authData', JSON.stringify(authData));

      const auth = getStoredAuth();

      expect(auth?.email).toBe('test@example.com');
      expect(auth?.authData).toEqual(authData);
      expect(auth?.storage).toBe(storage);
      expect(auth?.error).toBeNull();
    },
  );

  it.each(['localStorage', 'sessionStorage'] as const)(
    'migrates an existing result payload in %s without losing its password-change flag',
    (storageName) => {
      const storage = window[storageName];
      const payload = JSON.stringify({
        token: 'existing-token',
        mustChangePassword: true,
      });
      storage.setItem('loggedInUser', 'existing@example.com');
      storage.setItem('result', payload);

      expect(getStoredAuth()?.authData?.mustChangePassword).toBe(true);
      expect(storage.getItem('authData')).toBe(payload);
      expect(storage.getItem('result')).toBeNull();
      expect(getStoredAuth()?.authData?.token).toBe('existing-token');
    },
  );

  it('uses the active session payload instead of leftover local auth data', () => {
    localStorage.setItem('authData', JSON.stringify({ token: 'old-token' }));
    sessionStorage.setItem('loggedInUser', 'session@example.com');
    sessionStorage.setItem(
      'authData',
      JSON.stringify({ token: 'session-token', mustChangePassword: true }),
    );

    const auth = getStoredAuth();

    expect(auth?.email).toBe('session@example.com');
    expect(auth?.authData?.token).toBe('session-token');
    expect(auth?.authData?.mustChangePassword).toBe(true);
    expect(auth?.storage).toBe(sessionStorage);
  });

  it('preserves local login precedence when both stores have a logged-in user', () => {
    localStorage.setItem('loggedInUser', 'local@example.com');
    localStorage.setItem('authData', JSON.stringify({ token: 'local-token' }));
    sessionStorage.setItem('loggedInUser', 'session@example.com');
    sessionStorage.setItem(
      'authData',
      JSON.stringify({ token: 'session-token' }),
    );

    expect(getStoredAuth()?.email).toBe('local@example.com');
    expect(getStoredAuth()?.authData?.token).toBe('local-token');
  });

  it('prefers authData over an older result payload in the same store', () => {
    localStorage.setItem('loggedInUser', 'test@example.com');
    localStorage.setItem('authData', JSON.stringify({ token: 'new-token' }));
    localStorage.setItem('result', JSON.stringify({ token: 'old-token' }));

    expect(getStoredAuth()?.authData?.token).toBe('new-token');
  });

  it.each([
    '{invalid json',
    'null',
    '[]',
    '"a string"',
    '{"token":123}',
    '{"mustChangePassword":"true"}',
  ])('handles an invalid stored payload without throwing: %s', (payload) => {
    sessionStorage.setItem('loggedInUser', 'test@example.com');
    sessionStorage.setItem('authData', payload);

    const auth = getStoredAuth();

    expect(auth?.email).toBe('test@example.com');
    expect(auth?.authData).toBeNull();
    expect(auth?.storage).toBe(sessionStorage);
    expect(auth?.error).toBeInstanceOf(Error);
    expect(auth?.error?.message).toContain('Please sign in again.');
  });

  it('returns a migration failure to the caller while preserving the parsed auth data', () => {
    localStorage.setItem('loggedInUser', 'test@example.com');
    localStorage.setItem(
      'result',
      JSON.stringify({ token: 'token', mustChangePassword: true }),
    );
    const cause = new DOMException('Storage is full', 'QuotaExceededError');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw cause;
    });

    const auth = getStoredAuth();

    expect(auth?.authData?.mustChangePassword).toBe(true);
    expect(auth?.error?.cause).toBe(cause);
    expect(auth?.error?.message).toContain('Please sign in again.');
    expect(localStorage.getItem('result')).not.toBeNull();
  });

  it('does not borrow a payload from another store when the active login has none', () => {
    localStorage.setItem('authData', JSON.stringify({ token: 'old-token' }));
    sessionStorage.setItem('loggedInUser', 'session@example.com');

    expect(getStoredAuth()?.authData).toBeNull();
  });
});
