import type { RequestHandler } from 'express';
import type {
  SetNewPasswordRequest,
  SetNewPasswordResponse,
  SignInRequest,
  SignUpRequest,
  SignInResponse,
  SignUpResponse,
  ErrorResponse,
} from '../types/serverTypes.js';
import type { createAuthService } from '../services/authService.js';
import { cookiePolicy } from '../config/session.js';
import { verifiedActor } from '../middleware/authorization.js';
import { ServiceError } from '../services/serviceError.js';
import {
  establishSession,
  destroySession,
} from '../services/sessionLifecycle.js';

export function createAuthController(
  service: ReturnType<typeof createAuthService>,
  production: boolean,
) {
  const cookie = cookiePolicy(production);
  const signIn: RequestHandler<
    Record<string, never>,
    SignInResponse | ErrorResponse,
    SignInRequest
  > = async (req, res) => {
    const verified = await service.signIn(req.body);
    res.locals.actorId = verified.employeeId;
    let csrfToken: string;
    try {
      csrfToken = await establishSession(
        req,
        verified,
        req.body.rememberMe === true,
      );
    } catch {
      res.clearCookie(cookie.name, cookie.options);
      throw new ServiceError(503, {
        error: 'Could not save your session. Please try signing in again.',
        code: 'SESSION_RESTART_REQUIRED',
      });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      message: 'Signed in',
      userId: verified.employeeId,
      mustChangePassword: verified.mustChangePassword,
      csrfToken,
    });
  };

  const setNewPassword: RequestHandler<
    Record<string, never>,
    SetNewPasswordResponse | ErrorResponse,
    SetNewPasswordRequest
  > = async (req, res) => {
    const rememberMe = req.session.rememberMe === true;
    const identity = await service.setNewPassword(verifiedActor(req), req.body);
    try {
      const csrfToken = await establishSession(req, identity, rememberMe);
      res
        .status(200)
        .json({ message: 'password updated successfully', csrfToken });
    } catch {
      res.clearCookie(cookie.name, cookie.options);
      throw new ServiceError(503, {
        error:
          'Your password was changed. Sign in again with the new password.',
        code: 'PASSWORD_CHANGED_SIGN_IN_REQUIRED',
      });
    }
  };

  const signUp: RequestHandler<
    Record<string, never>,
    SignUpResponse | ErrorResponse,
    SignUpRequest
  > = async (req, res) => {
    const verified = await service.signUp(req.body);
    res.locals.actorId = verified.employeeId;
    let csrfToken: string;
    try {
      csrfToken = await establishSession(
        req,
        verified,
        req.body.rememberMe === true,
      );
    } catch {
      res.clearCookie(cookie.name, cookie.options);
      throw new ServiceError(503, {
        error: 'Your account was created. Please sign in.',
        code: 'ACCOUNT_CREATED_SIGN_IN_REQUIRED',
      });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      message: 'User signed up successfully',
      employee: verified.employee,
      userId: verified.employeeId,
      mustChangePassword: verified.mustChangePassword,
      csrfToken,
    });
  };

  const signOut: RequestHandler = async (req, res) => {
    await destroySession(req);
    res.clearCookie(cookie.name, cookie.options);
    res.setHeader('Cache-Control', 'no-store');
    res.status(204).end();
  };

  const me: RequestHandler = (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: 'Sign in required' });
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      userId: req.user.id,
      role: req.user.role,
      mustChangePassword: req.user.mustChangePassword,
    });
  };

  return { signIn, setNewPassword, signUp, signOut, me };
}
