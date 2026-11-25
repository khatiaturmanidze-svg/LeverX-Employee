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

  if (
    error instanceof Error &&
    'type' in error &&
    error.type === 'entity.too.large'
  ) {
    res.status(413).json({ error: 'request body too large' });
    return;
  }

  if (
    error instanceof Error &&
    'code' in error &&
    error.code === 'LIMIT_FILE_SIZE'
  ) {
    res.status(413).json({ error: 'Uploaded file is too large' });
    return;
  }
  if (error instanceof Error && error.name === 'MulterError') {
    res.status(400).json({ error: 'Invalid file upload' });
    return;
  }
  // Driver errors can contain SQL, input values, or connection credentials.
  console.error({
    event: 'request_failed',
    errorType: error instanceof Error ? error.name : 'UnknownError',
  });
  res.status(500).json({ error: 'internal server error' });
};
