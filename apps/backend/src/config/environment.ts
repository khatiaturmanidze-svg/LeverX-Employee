import { isIP } from 'node:net';

export function loadEnvironment(env: Record<string, string | undefined>) {
  const production = env.NODE_ENV === 'production';
  const frontendPort = Number(env.VITE_FE_PORT || 5173);
  const port = Number(env.PORT || env.VITE_API_PORT || 3000);
  if (
    ![port, frontendPort].every(
      (value) => Number.isInteger(value) && value >= 0 && value <= 65535,
    )
  )
    throw new Error('Invalid application port');
  const secret = env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32)
    throw new Error(
      'SESSION_SECRET must contain at least 32 bytes; generate it once with crypto.randomBytes(32)',
    );
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  let database: URL;
  try {
    database = new URL(env.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL must identify a PostgreSQL database');
  }
  if (
    !['postgres:', 'postgresql:'].includes(database.protocol) ||
    database.pathname.length < 2
  )
    throw new Error('DATABASE_URL must identify a PostgreSQL database');
  const schema = database.searchParams.get('schema') ?? 'public';
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema))
    throw new Error('Invalid database schema');
  const rawOrigin =
    env.APP_ORIGIN || (production ? '' : `http://localhost:${frontendPort}`);
  let origin: URL;
  try {
    origin = new URL(rawOrigin);
  } catch {
    throw new Error('APP_ORIGIN must identify the browser origin');
  }
  if (
    !['http:', 'https:'].includes(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash ||
    (production && origin.protocol !== 'https:')
  )
    throw new Error(
      'APP_ORIGIN must be an origin without a path; production requires HTTPS',
    );
  let trustProxy: number | string[] | undefined;
  if (env.TRUST_PROXY) {
    if (/^\d+$/.test(env.TRUST_PROXY)) {
      trustProxy = Number(env.TRUST_PROXY);
      if (!Number.isSafeInteger(trustProxy) || trustProxy > 10)
        throw new Error('Invalid TRUST_PROXY hop count');
    } else {
      trustProxy = env.TRUST_PROXY.split(',').map((value) => value.trim());
      for (const address of trustProxy) {
        const [ip, mask] = address.split('/');
        const family = isIP(ip);
        if (
          !['loopback', 'linklocal', 'uniquelocal'].includes(address) &&
          (!family ||
            (mask !== undefined &&
              (!/^\d+$/.test(mask) ||
                Number(mask) > (family === 4 ? 32 : 128))))
        )
          throw new Error(
            'TRUST_PROXY must name trusted IPs/subnets or a verified hop count; true is not allowed',
          );
      }
    }
  }
  if (
    env.ALLOW_PUBLIC_SIGNUP !== undefined &&
    !['true', 'false'].includes(env.ALLOW_PUBLIC_SIGNUP)
  )
    throw new Error('ALLOW_PUBLIC_SIGNUP must be true or false');
  return {
    production,
    frontendPort,
    port,
    secret,
    databaseUrl: env.DATABASE_URL,
    schema,
    appOrigin: origin.origin,
    trustProxy,
    allowPublicSignup:
      env.ALLOW_PUBLIC_SIGNUP === undefined
        ? !production
        : env.ALLOW_PUBLIC_SIGNUP === 'true',
  };
}
