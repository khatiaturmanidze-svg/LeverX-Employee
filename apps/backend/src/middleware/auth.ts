import type { RequestHandler } from 'express';
import type { PrismaClient } from '../generated/prisma/client.js';
import { cookiePolicy, IDLE_TIMEOUT_MS } from '../config/session.js';
import { destroySession } from '../services/sessionLifecycle.js';
import { ServiceError } from '../services/serviceError.js';

export function createAuthMiddleware(
  prisma: PrismaClient,
  production: boolean,
  now: () => number = Date.now,
): RequestHandler {
  const cookie = cookiePolicy(production);

  return async (req, res, next) => {
    const rejectSession = async () => {
      await destroySession(req);
      res.clearCookie(cookie.name, cookie.options);
      res.status(401).json({ error: 'Sign in required' });
    };

    const state = req.session;
    const currentTime = now();
    if (
      !state.employeeId ||
      !Number.isSafeInteger(state.sessionVersion) ||
      typeof state.lastSeenAt !== 'number' ||
      typeof state.absoluteExpiresAt !== 'number' ||
      !Number.isFinite(state.lastSeenAt) ||
      !Number.isFinite(state.absoluteExpiresAt) ||
      typeof state.authenticatedAt !== 'number' ||
      !Number.isFinite(state.authenticatedAt) ||
      state.lastSeenAt > currentTime ||
      state.authenticatedAt > currentTime ||
      currentTime >= state.absoluteExpiresAt ||
      currentTime - state.lastSeenAt >= IDLE_TIMEOUT_MS
    ) {
      await rejectSession();
      return;
    }

    const account = await prisma.authUser
      .findUnique({
        where: { employeeId: state.employeeId },
        select: {
          sessionVersion: true,
          mustChangePassword: true,
          employee: { select: { id: true, role: true } },
        },
      })
      .catch(() => {
        throw new ServiceError(503, {
          error: 'Account service unavailable. Please try again later.',
        });
      });

    if (!account || account.sessionVersion !== state.sessionVersion) {
      await rejectSession();
      return;
    }

    req.user = {
      id: account.employee.id,
      role: account.employee.role,
      mustChangePassword: account.mustChangePassword,
      sessionVersion: account.sessionVersion,
    };

    state.lastSeenAt = currentTime;
    state.cookie.maxAge = Math.min(
      IDLE_TIMEOUT_MS,
      state.absoluteExpiresAt - currentTime,
    );
    next();
  };
}
