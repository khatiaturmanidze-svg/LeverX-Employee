import { Router } from 'express';
import type { RequestHandler } from 'express';
import multer from 'multer';
import type { createEmployeeController } from '../controllers/employeeController.js';

export function createEmployeeRoutes(
  controller: ReturnType<typeof createEmployeeController>,
  authMiddleware: RequestHandler,
) {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });
  router.get('/users', authMiddleware, controller.listEmployees);
  router.get('/users/:id', authMiddleware, controller.getEmployee);
  router.put('/users/:id', controller.updateEmployee);
  router.put('/users/:id/role', authMiddleware, controller.updateRole);
  router.post('/users', authMiddleware, controller.createEmployee);
  router.post(
    '/users/upload',
    authMiddleware,
    upload.single('file'),
    controller.uploadSpreadsheet,
  );
  return router;
}
