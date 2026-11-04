import { Router } from 'express';
import type { createVisaController } from '../controllers/visaController.js';

export function createVisaRoutes(
  controller: ReturnType<typeof createVisaController>,
) {
  const router = Router({ mergeParams: true });
  router.get('/', controller.listVisas);
  router.get('/:visaId', controller.getVisa);
  router.post('/', controller.createVisa);
  router.patch('/:visaId', controller.updateVisa);
  router.delete('/:visaId', controller.deleteVisa);
  return router;
}
