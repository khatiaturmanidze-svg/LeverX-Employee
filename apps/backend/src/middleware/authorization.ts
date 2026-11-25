import type { Request, RequestHandler } from 'express';
import type { VerifiedUser } from '../types/auth.js';
import { ServiceError } from '../services/serviceError.js';

export function verifiedActor(req: Request): VerifiedUser {
  if (!req.user) throw new ServiceError(401, { error: 'Sign in required' });
  return req.user;
}

export const requirePasswordChanged: RequestHandler = (req, _res, next) => {
  const actor = verifiedActor(req);
  if (actor.mustChangePassword) {
    throw new ServiceError(403, {
      error: 'Replace your temporary password before continuing',
      code: 'PASSWORD_CHANGE_REQUIRED',
    });
  }
  next();
};

export function requireRole(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!roles.includes(verifiedActor(req).role)) {
      throw new ServiceError(403, { error: 'Permission denied' });
    }
    next();
  };
}
