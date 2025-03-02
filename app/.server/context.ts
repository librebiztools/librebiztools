import type { Session } from 'react-router';
import config from './config';
import { type TransactionType, db } from './db';
import * as schema from './db/schema';
import { type PreferencesData, getPreferences } from './preferences';
import * as services from './services';
import { type SessionData, type SessionFlashData, getSession } from './session';

export type Context = {
  session: Session<SessionData, SessionFlashData>;
  preferences: Session<PreferencesData>;
  services: typeof services;
  db: typeof db;
  schema: typeof schema;
  tx: TransactionType | undefined;
  config: typeof config;
};

export async function getContext(request: Request): Promise<Context> {
  const cookie = request.headers.get('Cookie');
  return {
    session: await getSession(cookie),
    preferences: await getPreferences(cookie),
    services,
    db,
    schema,
    tx: undefined,
    config,
  };
}
