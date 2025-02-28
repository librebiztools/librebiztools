import { createCookieSessionStorage } from 'react-router';
import config from './config';

export type SessionData = {
  userId: number;
  accessToken: string;
  dismissedEmailConfirmation: boolean;
};

export type SessionFlashData = {
  // Displays on site as a "success" toast
  message: string;
  // Displays on site as an "error" toast
  error: string;
  // Path to return to after login
  returnUrl: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: config.SESSION_TIMEOUT_MINUTES * 60,
      sameSite: 'lax',
      secure: true,
      secrets: ['s3cr3t'], // Just so the cookie is "signed"
    },
  });

export { getSession, commitSession, destroySession };
