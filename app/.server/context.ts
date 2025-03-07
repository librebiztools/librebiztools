import type { Session } from 'react-router';
import { None, type Option } from 'ts-results-es';
import config from './config';
import type { TransactionType } from './db';
import type { users } from './db/schema';
import { type PreferencesData, getPreferences } from './preferences';
import { getUserById } from './services/user';
import { type SessionData, type SessionFlashData, getSession } from './session';

type User = typeof users.$inferSelect;

export type Context = {
  session: Session<SessionData, SessionFlashData>;
  preferences: Session<PreferencesData>;
  tx: TransactionType | undefined;
  config: typeof config;
  user: Option<User>;
};

export async function getContext(request: Request): Promise<Context> {
  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);
  const userId = session.get('userId');

  const context = {
    session,
    preferences: await getPreferences(cookie),
    tx: undefined,
    config,
    user: None,
  };

  if (userId) {
    const user = await getUserById({ id: userId }, context);

    return {
      ...context,
      user,
    };
  }

  return context;
}

export async function getTestContext(): Promise<Context> {
  return {
    session: await getSession(''),
    preferences: await getPreferences(''),
    tx: undefined,
    config,
    user: None,
  };
}
