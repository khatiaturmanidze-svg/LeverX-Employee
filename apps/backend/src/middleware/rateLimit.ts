import { createHash } from 'node:crypto';
import type { RequestHandler } from 'express';
import type { PrismaClient } from '../generated/prisma/client.js';

export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

export function createRateLimiter(
  prisma: PrismaClient,
  scope: string,
  policy: RateLimitPolicy,
): RequestHandler {
  return async (req, res, next) => {
    const now = Date.now();
    const window = Math.floor(now / policy.windowMs);
    const digest = createHash('sha256')
      .update(`${scope}:${req.ip ?? 'unknown'}:${window}`)
      .digest('hex');
    const expiresAt = new Date((window + 1) * policy.windowMs);
    // The atomic increment is shared by all API instances using this schema.
    const bucket = await prisma.authRateLimit.upsert({
      where: { key: digest },
      create: { key: digest, hits: 1, expiresAt },
      update: { hits: { increment: 1 } },
    });
    // Bound retained counters without a per-process cleanup timer.
    if (bucket.hits === 1)
      await prisma.authRateLimit.deleteMany({
        where: { expiresAt: { lt: new Date(now) } },
      });
    if (bucket.hits > policy.limit) {
      res.setHeader(
        'Retry-After',
        Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
      );
      res
        .status(429)
        .json({ error: 'Too many attempts. Please try again later.' });
      return;
    }
    next();
  };
}
