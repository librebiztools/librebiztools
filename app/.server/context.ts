import type { Session } from 'react-router';
import config from './config';
import type { TransactionType } from './db';
import { type PreferencesData, getPreferences } from './preferences';
import { type SessionData, type SessionFlashData, getSession } from './session';

export type Context = {
  session: Session<SessionData, SessionFlashData>;
  preferences: Session<PreferencesData>;
  tx: TransactionType | undefined;
  config: typeof config;
};

export async function getContext(request: Request): Promise<Context> {
  const cookie = request.headers.get('Cookie');
  return {
    session: await getSession(cookie),
    preferences: await getPreferences(cookie),
    tx: undefined,
    config,
  };
}

export async function getTestContext(): Promise<Context> {
  return {
    session: await getSession(''),
    preferences: await getPreferences(''),
    tx: undefined,
    config,
  };
}
