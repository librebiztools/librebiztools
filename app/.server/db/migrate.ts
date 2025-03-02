import { migrate } from 'drizzle-orm/pglite/migrator';

import { db } from '.';

export async function applyMigrations() {
  await migrate(db, { migrationsFolder: 'drizzle' });
}
