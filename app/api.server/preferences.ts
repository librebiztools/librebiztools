import { createCookieSessionStorage } from 'react-router';

export type PreferencesData = {
  theme: string;
};

const now = new Date();

const {
  getSession: getPreferences,
  commitSession: commitPreferences,
  destroySession: destroyPreferences,
} = createCookieSessionStorage<PreferencesData>({
  cookie: {
    name: '__preferences',
    httpOnly: true,
    expires: new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()),
    sameSite: 'lax',
    secure: true,
    secrets: ['s3cr3t'], // Just so the cookie is "signed"
  },
});

export { getPreferences, commitPreferences, destroyPreferences };
