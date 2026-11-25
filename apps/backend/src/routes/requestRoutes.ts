import { Router } from 'express';
import type { RequestHandler } from 'express';
import { requirePasswordChanged } from '../middleware/authorization.js';
import type { createRequestController } from '../controllers/requestController.js';

export function createRequestRoutes(
  controller: ReturnType<typeof createRequestController>,
  authMiddleware: RequestHandler,
) {
  const router = Router();
  router.use('/requests', authMiddleware, requirePasswordChanged);
  router.get('/requests/:id', controller.listRequests);
  router.post('/requests/:id', controller.createRequest);
  router.put('/requests/:employeeId', controller.updateRequest);
  return router;
}
