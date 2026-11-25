import type { RequestHandler } from 'express';
import type {
  SetNewPasswordRequest,
  SetNewPasswordResponse,
  SignInRequest,
  SignUpRequest,
  SignInResponse,
  SignUpResponse,
  ErrorResponse,
} from '../serverTypes.js';
import type { createAuthService } from '../services/authService.js';

export function createAuthController(
  service: ReturnType<typeof createAuthService>,
) {
  const signIn: RequestHandler<
    Record<string, never>,
    SignInResponse | ErrorResponse,
    SignInRequest
  > = async (req, res) => {
    res.status(200).json(await service.signIn(req.body));
  };

  const setNewPassword: RequestHandler<
    Record<string, never>,
    SetNewPasswordResponse | ErrorResponse,
    SetNewPasswordRequest
  > = async (req, res) => {
    res.status(200).json(await service.setNewPassword(req.body));
  };

  const signUp: RequestHandler<
    Record<string, never>,
    SignUpResponse | ErrorResponse,
    SignUpRequest
  > = async (req, res) => {
    res.status(200).json(await service.signUp(req.body));
  };
  return { signIn, setNewPassword, signUp };
}
