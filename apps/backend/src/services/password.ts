export function generateTemporaryPassword(length = 12): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  return Array.from({ length }, () =>
    chars.charAt(randomInt(chars.length)),
  ).join('');
}
import { randomInt } from 'node:crypto';
import { ServiceError } from './serviceError.js';

export function validatePassword(
  password: unknown,
): asserts password is string {
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw new ServiceError(400, {
      error:
        'Password must contain at least 8 characters and at most 72 UTF-8 bytes',
    });
  }
}
