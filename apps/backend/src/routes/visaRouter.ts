import { Router } from 'express';
import { createVisaController } from '../controllers/visaController.js';

export function createVisaRoutes(
  controller: ReturnType<typeof createVisaController>,
) {
  const router = Router();
  router.get('/', controller.listVisas);
}
