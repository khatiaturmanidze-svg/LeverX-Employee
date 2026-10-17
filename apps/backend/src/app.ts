import express from 'express';
import cors from 'cors';
import type { Pool } from 'pg';
import type { Database } from './services/types.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { createSyntheticLatencyMiddleware } from './middleware/syntheticLatency.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createHealthRoutes } from './routes/healthRoutes.js';
import { createAuthService } from './services/authService.js';
import { createAuthController } from './controllers/authController.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createEmployeeService } from './services/employeeService.js';
import { createEmployeeController } from './controllers/employeeController.js';
import { createEmployeeRoutes } from './routes/employeeRoutes.js';
import { createRequestService } from './services/requestService.js';
import { createRequestController } from './controllers/requestController.js';
import { createRequestRoutes } from './routes/requestRoutes.js';

import { createReadRepositories } from './repositories/index.js';

interface AppOptions {
  frontendPort: number;
  token: string;
  staticDirectory: string;
}

export function createApp(
  db: Database,
  options: AppOptions,
  postgresPool: Pool,
) {
  const app = express();
  app.use(cors({ origin: `http://localhost:${options.frontendPort}` }));
  app.use(express.json());
  app.use(express.static(options.staticDirectory));
  const authMiddleware = createAuthMiddleware(options.token);

  const reads = createReadRepositories(postgresPool);

  // Only business API routes receive artificial latency.
  app.use(
    ['/sign-in', '/sign-up', '/set-new-password', '/users', '/requests'],
    createSyntheticLatencyMiddleware(),
  );
  app.use(createHealthRoutes());
  app.use(
    createAuthRoutes(
      createAuthController(createAuthService(db, options.token)),
      authMiddleware,
    ),
  );
  app.use(
    createEmployeeRoutes(
      createEmployeeController(createEmployeeService(db, reads)),
      authMiddleware,
    ),
  );
  app.use(
    createRequestRoutes(
      createRequestController(createRequestService(db, reads)),
    ),
  );
  app.use(errorHandler);
  return app;
}
