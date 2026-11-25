import express from 'express';
import cors from 'cors';
import type { PrismaClient } from './generated/prisma/client.js';
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
import { createVisaRoutes } from './routes/visaRouter.js';
import { createVisaController } from './controllers/visaController.js';
import { createVisaService } from './services/visaService.js';
import { createRepositories } from './repositories/index.js';
import type session from 'express-session';
import { createSessionMiddleware } from './config/session.js';
import { createCsrfMiddleware, issueCsrfToken } from './middleware/csrf.js';
import { requirePasswordChanged } from './middleware/authorization.js';
import { createAuditMiddleware, type AuditLogger } from './middleware/audit.js';
import {
  createRateLimiter,
  type RateLimitPolicy,
} from './middleware/rateLimit.js';
interface AppOptions {
  frontendPort: number;
  staticDirectory: string;
  appOrigin: string;
  trustProxy?: number | string[];
  allowPublicSignup?: boolean;
  audit?: AuditLogger;
  rateLimits?: { auth: RateLimitPolicy; csrf: RateLimitPolicy };
  now?: () => number;
  session: {
    store: session.Store;
    secret: string;
    production: boolean;
  };
}

export function createApp(prisma: PrismaClient, options: AppOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    );
    next();
  });
  if (options.trustProxy !== undefined)
    app.set('trust proxy', options.trustProxy);
  app.locals.allowPublicSignup =
    options.allowPublicSignup ?? !options.session.production;
  app.use(
    createAuditMiddleware(
      options.audit ?? ((event) => console.info(JSON.stringify(event))),
    ),
  );
  const sessionMiddleware = createSessionMiddleware(options.session);
  const authMiddleware = createAuthMiddleware(
    prisma,
    options.session.production,
    options.now,
  );
  const csrfMiddleware = createCsrfMiddleware(options.appOrigin);

  app.use(cors({ origin: options.appOrigin, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.static(options.staticDirectory, { redirect: false }));

  app.use(createHealthRoutes());
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.get(
    '/csrf',
    createRateLimiter(
      prisma,
      'csrf',
      options.rateLimits?.csrf ?? { limit: 120, windowMs: 10 * 60 * 1000 },
    ),
  );
  app.post(
    ['/sign-in', '/sign-up', '/set-new-password'],
    createRateLimiter(
      prisma,
      'auth',
      options.rateLimits?.auth ?? { limit: 30, windowMs: 15 * 60 * 1000 },
    ),
  );
  app.use(sessionMiddleware);
  app.use(csrfMiddleware);
  app.get('/csrf', issueCsrfToken);
  app.post('/sign-up', (_req, res, next) => {
    if (!app.locals.allowPublicSignup) {
      res.status(403).json({
        error: 'Public signup is disabled. Contact your administrator.',
      });
      return;
    }
    next();
  });

  const repositories = createRepositories(prisma);

  // Only business API routes receive artificial latency.
  app.use(
    ['/sign-in', '/sign-up', '/set-new-password', '/users', '/requests'],
    createSyntheticLatencyMiddleware(),
  );
  app.use(
    createAuthRoutes(
      createAuthController(
        createAuthService(prisma),
        options.session.production,
      ),
      authMiddleware,
    ),
  );
  app.use(
    createEmployeeRoutes(
      createEmployeeController(createEmployeeService(prisma, repositories)),
      authMiddleware,
    ),
  );
  app.use(
    createRequestRoutes(
      createRequestController(createRequestService(prisma, repositories)),
      authMiddleware,
    ),
  );

  app.use(
    '/employees/:employeeId/visas',
    authMiddleware,
    requirePasswordChanged,
    createVisaRoutes(
      createVisaController(createVisaService(prisma, repositories)),
    ),
  );
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
  app.use(errorHandler);
  return app;
}
