import { Router } from 'express';
import type { RequestHandler } from 'express';
import multer from 'multer';
import type { createEmployeeController } from '../controllers/employeeController.js';
import {
  requirePasswordChanged,
  requireRole,
} from '../middleware/authorization.js';

export function createEmployeeRoutes(
  controller: ReturnType<typeof createEmployeeController>,
  authMiddleware: RequestHandler,
) {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  });
  router.use('/users', authMiddleware, requirePasswordChanged);
  router.get('/users', controller.listEmployees);
  router.get('/users/:id', controller.getEmployee);
  router.put('/users/:id', controller.updateEmployee);
  router.put('/users/:id/role', requireRole('Admin'), controller.updateRole);
  router.post('/users', requireRole('Admin'), controller.createEmployee);
  router.post(
    '/users/upload',
    requireRole('Admin'),
    upload.single('file'),
    controller.uploadSpreadsheet,
  );
  return router;
}
