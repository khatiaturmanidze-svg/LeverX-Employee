import { randomBytes } from 'node:crypto';
import type { Request } from 'express';
import {
  IDLE_TIMEOUT_MS,
  STANDARD_ABSOLUTE_MS,
  REMEMBERED_ABSOLUTE_MS,
} from '../config/session.js';

export function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

export function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

export async function establishSession(
  req: Request,
  identity: { employeeId: string; sessionVersion: number },
  rememberMe: boolean,
) {
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });

  const now = Date.now();
  const absoluteLifetime = rememberMe
    ? REMEMBERED_ABSOLUTE_MS
    : STANDARD_ABSOLUTE_MS;

  req.session.employeeId = identity.employeeId;
  req.session.sessionVersion = identity.sessionVersion;
  req.session.authenticatedAt = now;
  req.session.lastSeenAt = now;
  req.session.absoluteExpiresAt = now + absoluteLifetime;
  req.session.rememberMe = rememberMe;
  req.session.csrfToken = randomBytes(32).toString('hex');
  req.session.cookie.maxAge = Math.min(IDLE_TIMEOUT_MS, absoluteLifetime);

  await saveSession(req);
  return req.session.csrfToken;
}
