import { createCookieSessionStorage } from 'react-router';
import config from './config';

type SessionData = {
  accessToken: string;
};

type SessionFlashData = {
  // Displays on site as a "success" toast
  message: string;
  // Displays on site as an "error" toast
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: config.SESSION_TIMEOUT_MINUTES * 60,
      sameSite: 'lax',
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
