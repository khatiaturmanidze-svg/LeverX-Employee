// One-way migration cleanup only. Browser storage is never an auth credential.
export function clearLegacyAuthStorage() {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    try {
      for (const key of ['authData', 'result', 'loggedInUser'])
        window[name].removeItem(key);
    } catch {
      /* Storage can be disabled; cookie authentication still works. */
    }
  }
}
