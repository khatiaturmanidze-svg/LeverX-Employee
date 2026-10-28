import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
export function createHealthRoutes() {
  const router = Router();
  router.get('/health', getHealth);
  return router;
}
