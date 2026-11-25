import 'express-session';
import 'express-serve-static-core';

export interface VerifiedUser {
  id: string;
  role: string;
  mustChangePassword: boolean;
  sessionVersion: number;
}

declare module 'express-session' {
  interface SessionData {
    employeeId?: string;
    sessionVersion?: number;
    authenticatedAt?: number;
    lastSeenAt?: number;
    absoluteExpiresAt?: number;
    rememberMe?: boolean;
    csrfToken?: string;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: VerifiedUser;
  }
}
