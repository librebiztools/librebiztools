import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import config from '../config';
import * as schema from '../db/schema';
const { Pool } = pg;

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST } = config;

const pool = new Pool({
  connectionString: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DB}`,
});

export const db = drizzle({
  client: pool,
  schema,
});

export type DatabaseType = typeof db;
export type TransactionType = Parameters<
  Parameters<DatabaseType['transaction']>[0]
>[0];

export * from './seed';
export * from './migrate';
export * from './insert-missing-email-templates';
