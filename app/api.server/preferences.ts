import type { Session } from 'react-router';
import { createCookieSessionStorage } from 'react-router';

export type PreferencesData = {
  theme: string;
};

const {
  getSession: getPreferences,
  commitSession,
  destroySession: destroyPreferences,
} = createCookieSessionStorage<PreferencesData>({
  cookie: {
    name: '__preferences',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    secrets: ['s3cr3t'], // Just so the cookie is "signed"
  },
});

async function commitPreferences(
  session: Session<PreferencesData>,
): Promise<string> {
  const now = new Date();
  return commitSession(session, {
    expires: new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()),
  });
}

export { getPreferences, commitPreferences, destroyPreferences };
