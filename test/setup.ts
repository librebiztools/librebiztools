import { afterAll, afterEach, beforeEach, vi } from 'vitest';

import { applyMigrations } from '~/api.server/db/migrate';
import { reset } from '~/api.server/db/reset';

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

// Apply migrations before each test
beforeEach(async () => {
  await applyMigrations();
});

// Clean up the database after each test
afterEach(async () => {
  await reset();
});

// Free up resources after all tests are done
afterAll(async () => {});
