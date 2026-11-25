import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { saveSession } from '../services/sessionLifecycle.js';

export const issueCsrfToken: RequestHandler = async (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString('hex');
    await saveSession(req);
  }
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    csrfToken: req.session.csrfToken,
    allowPublicSignup: req.app.locals.allowPublicSignup,
  });
};

export function createCsrfMiddleware(appOrigin: string): RequestHandler {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
      return;
    }

    const supplied = req.get('X-CSRF-Token');
    const expected = req.session.csrfToken;
    const correctOrigin = req.get('Origin') === appOrigin;
    const validShape =
      typeof supplied === 'string' &&
      typeof expected === 'string' &&
      /^[a-f0-9]{64}$/.test(supplied) &&
      /^[a-f0-9]{64}$/.test(expected);

    if (!correctOrigin || !validShape) {
      res
        .status(403)
        .json({ error: 'CSRF verification failed', code: 'CSRF_FAILED' });
      return;
    }

    if (
      !timingSafeEqual(
        Buffer.from(supplied!, 'hex'),
        Buffer.from(expected!, 'hex'),
      )
    ) {
      res
        .status(403)
        .json({ error: 'CSRF verification failed', code: 'CSRF_FAILED' });
      return;
    }
    next();
  };
}
