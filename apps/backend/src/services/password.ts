export function generateTemporaryPassword(length = 12): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');
}
