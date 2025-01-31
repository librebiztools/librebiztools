import { drizzle } from 'drizzle-orm/node-postgres';
import config from '../config';
import * as schema from '../db/schema';
import pg from 'pg';
const { Pool } = pg;

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = config;

const pool = new Pool({
  connectionString: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost/${POSTGRES_DB}`,
});

export const db = drizzle({
  client: pool,
  schema,
});
