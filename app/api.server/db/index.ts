import { drizzle } from 'drizzle-orm/libsql';
import config from '~/api.server/config';
import * as schema from '~/api.server/db/schema';

export function openConnection() {
  const db = drizzle(config.DB_FILE_NAME, { schema });
  return db;
}
