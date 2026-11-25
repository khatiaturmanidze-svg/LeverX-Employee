import type { RequestHandler } from 'express';

export interface AuditEvent {
  event: string;
  actorId?: string;
  status: number;
  time: string;
}
export type AuditLogger = (event: AuditEvent) => void;

export function createAuditMiddleware(log: AuditLogger): RequestHandler {
  return (req, res, next) => {
    res.on('finish', () => {
      let event: string | undefined;
      if (req.method === 'POST' && req.path === '/sign-in') event = 'login';
      if (req.method === 'POST' && req.path === '/sign-up')
        event = 'registration';
      if (req.method === 'POST' && req.path === '/sign-out') event = 'logout';
      if (req.method === 'POST' && req.path === '/set-new-password')
        event = 'password_change';
      if (req.method === 'PUT' && /^\/users\/[^/]+\/role$/.test(req.path))
        event = 'role_change';
      if (!event && [401, 403, 429].includes(res.statusCode))
        event = 'access_denied';
      if (event) {
        // Never log request bodies, cookies, headers, hashes, or CSRF values.
        try {
          log({
            event,
            actorId: req.user?.id ?? res.locals.actorId,
            status: res.statusCode,
            time: new Date().toISOString(),
          });
        } catch {
          /* Observability must not change a completed HTTP response. */
        }
      }
    });
    next();
  };
}
