import { vi } from 'vitest';
import type { SessionAccount } from '../app/sessionSlice';

export function mockSessionServer(initial: SessionAccount | null = null) {
  let account = initial;
  let csrf = 'initial-csrf';
  const calls: Request[] = [];
  const NativeRequest = globalThis.Request;
  vi.stubGlobal(
    'Request',
    class extends NativeRequest {
      constructor(
        input: ConstructorParameters<typeof NativeRequest>[0],
        init?: ConstructorParameters<typeof NativeRequest>[1],
      ) {
        super(
          typeof input === 'string'
            ? new URL(input, window.location.origin)
            : input,
          init,
        );
      }
    },
  );
  const fetch = vi.fn(async (input: Request) => {
    calls.push(input);
    const path = new URL(input.url).pathname.replace('/api', '');
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { 'content-type': 'application/json' },
      });
    if (path === '/me')
      return account ? json(account) : json({ error: 'Sign in required' }, 401);
    if (path === '/csrf')
      return json({ csrfToken: csrf, allowPublicSignup: true });
    if (['/sign-in', '/sign-up'].includes(path)) {
      account = {
        userId: 'signed-in-id',
        role: 'Employee',
        mustChangePassword: false,
      };
      csrf = 'rotated-csrf';
      return json({
        message: 'Signed in',
        userId: account.userId,
        mustChangePassword: false,
        csrfToken: csrf,
      });
    }
    if (path === '/set-new-password') {
      account = { ...account!, mustChangePassword: false };
      csrf = 'password-csrf';
      return json({ message: 'Password updated', csrfToken: csrf });
    }
    if (path === '/sign-out') {
      account = null;
      return new Response(null, { status: 204 });
    }
    if (path === '/users') return json([{ _id: 'cached-user' }]);
    return json({ error: 'Not found' }, 404);
  });
  vi.stubGlobal('fetch', fetch);
  return {
    calls,
    fetch,
    setAccount(value: SessionAccount | null) {
      account = value;
    },
  };
}
