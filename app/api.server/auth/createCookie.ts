import config from '../config';

export function createCookie(token: string): string {
  return `accessToken=${token}; Max-Age=${config.SESSION_TIMEOUT_MINUTES * 60}; SameSite=Lax; Secure; HttpOnly;`;
}
