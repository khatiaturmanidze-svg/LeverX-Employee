import type { RequestHandler } from 'express';
import type { HealthResponse } from '../serverTypes.js';
export const getHealth: RequestHandler<
  Record<string, never>,
  HealthResponse
> = (_req, res) => {
  res.status(200).json({ message: 'Server is running' });
};
