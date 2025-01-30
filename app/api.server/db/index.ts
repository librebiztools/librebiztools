import { drizzle } from 'drizzle-orm/libsql';
import config from '../config';
import * as schema from '../db/schema';

export function openConnection() {
  const db = drizzle(config.DB_FILE_NAME, { schema });
  return db;
}
