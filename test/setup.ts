import { beforeAll, vi } from 'vitest';

import { applyMigrations } from '~/api.server/db/migrate';
import { seed } from '~/api.server/db/seed';

// Replace the database with a new in-memory database
vi.mock('~/api.server/db', async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { db: actual } =
    await vi.importActual<typeof import('~/api.server/db')>('~/api.server/db');
  const schema = await import('~/api.server/db/schema');
  const client = new PGlite();
  const db = drizzle(client, { schema });
  return {
    ...actual,
    db,
  };
});

beforeAll(async () => {
  await applyMigrations();
  await seed();
});
