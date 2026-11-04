import type { ErrorRequestHandler } from 'express';
import { ServiceError } from '../services/serviceError.js';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ServiceError) {
    if (typeof error.body === 'string') {
      res.status(error.status).send(error.body);
    } else {
      res.status(error.status).json(error.body);
    }
    return;
  }

  if (
    error instanceof SyntaxError &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    res.status(400).json({ error: 'invalid JSON' });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'internal server error' });
};
