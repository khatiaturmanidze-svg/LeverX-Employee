import type { Request, Response, NextFunction } from 'express';
import type { ErrorResponse } from '../serverTypes.js';
export function createAuthMiddleware(expectedToken: string) {
  return function authMiddleware(
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction,
  ): void {
    const token = req.headers['authorization'];

    if (!token) {
      res.status(401).json({ error: 'not authorized' });
      return;
    }

    if (token !== expectedToken) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    next();
  };
}
