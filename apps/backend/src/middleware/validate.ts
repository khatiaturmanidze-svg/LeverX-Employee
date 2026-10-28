import type { RequestHandler } from 'express';
import { createVisaSchema } from '../schemas/visaSchema.js';
import { ServiceError } from '../services/serviceError.js';

export const validateCreateVisa: RequestHandler = (req, res, next) => {
  //safeParse(req.body) checks the submitted body against  visa schema
  const result = createVisaSchema.safeParse(req.body);
  // validation fail
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    next(new ServiceError(400, { error: message }));
    return;
  }

  req.body = result.data;
  next();
};
