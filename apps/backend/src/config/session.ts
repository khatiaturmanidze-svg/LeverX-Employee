import session from 'express-session';
import type { RequestHandler } from 'express';
import { ServiceError } from '../services/serviceError.js';

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const STANDARD_ABSOLUTE_MS = 8 * 60 * 60 * 1000;
export const REMEMBERED_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;

export function cookiePolicy(production: boolean) {
  return {
    name: production ? '__Host-leverx.sid' : 'leverx.sid',
    options: {
      httpOnly: true,
      secure: production,
      sameSite: 'lax' as const,
      path: '/',
    },
  };
}

export function createSessionMiddleware(options: {
  store: session.Store;
  secret: string;
  production: boolean;
}) {
  if (!options.secret) throw new Error('SESSION_SECRET is required');
  const cookie = cookiePolicy(options.production);
  const middleware = session({
    name: cookie.name,
    store: options.store,
    secret: options.secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      ...cookie.options,
      maxAge: IDLE_TIMEOUT_MS,
    },
  });
  const handler: RequestHandler = (req, res, next) => {
    middleware(req, res, (error?: unknown) => {
      if (error) {
        next(
          new ServiceError(503, {
            error: 'Session service unavailable. Please try again later.',
          }),
        );
        return;
      }
      next();
    });
  };
  return handler;
}
