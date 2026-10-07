import type { ErrorRequestHandler } from 'express';
import { ServiceError } from '../services/serviceError.js';
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (!(error instanceof ServiceError)) {
    next(error);
    return;
  }
  if (typeof error.body === 'string') {
    res.status(error.status).send(error.body);
    return;
  }
  res.status(error.status).json(error.body);
};
