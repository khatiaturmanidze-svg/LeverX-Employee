import { Router } from 'express';
import type { createRequestController } from '../controllers/requestController.js';

export function createRequestRoutes(
  controller: ReturnType<typeof createRequestController>,
) {
  const router = Router();
  router.get('/requests/:id', controller.listRequests);
  router.post('/requests/:id', controller.createRequest);
  router.put('/requests/:employeeId', controller.updateRequest);
  return router;
}
