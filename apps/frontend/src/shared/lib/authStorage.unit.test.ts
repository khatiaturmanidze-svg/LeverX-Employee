import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLegacyAuthStorage } from './authStorage';
describe('legacy authentication storage cleanup', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  it('removes all old credentials while preserving UI preferences', () => {
    for (const storage of [localStorage, sessionStorage]) {
      for (const key of ['authData', 'result', 'loggedInUser'])
        storage.setItem(key, 'untrusted');
      storage.setItem('theme', 'dark');
    }
    clearLegacyAuthStorage();
    for (const storage of [localStorage, sessionStorage]) {
      for (const key of ['authData', 'result', 'loggedInUser'])
        expect(storage.getItem(key)).toBeNull();
      expect(storage.getItem('theme')).toBe('dark');
    }
  });
  it('is idempotent', () => {
    clearLegacyAuthStorage();
    expect(() => clearLegacyAuthStorage()).not.toThrow();
  });
  it('does not make cookie authentication depend on available web storage', () => {
    const remove = vi
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('Storage blocked');
      });
    expect(() => clearLegacyAuthStorage()).not.toThrow();
    remove.mockRestore();
  });
});
