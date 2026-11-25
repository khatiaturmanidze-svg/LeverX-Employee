import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { createAuthController } from '../controllers/authController.js';

export function createAuthRoutes(
  controller: ReturnType<typeof createAuthController>,
  authMiddleware: RequestHandler,
) {
  const router = Router();
  router.post('/sign-in', controller.signIn);
  router.post('/set-new-password', authMiddleware, controller.setNewPassword);
  router.post('/sign-up', controller.signUp);
  router.get('/me', authMiddleware, controller.me);
  router.post('/sign-out', controller.signOut);
  return router;
}
