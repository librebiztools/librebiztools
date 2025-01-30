import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { afterAll, afterEach, beforeEach, vi } from 'vitest';

import * as schema from '~/api.server/db/schema';
import { applyMigrations } from '~/api.server/db/migrate';
import { reset } from '~/api.server/db/reset';

// Replace the database with a new in-memory database
vi.mock('~/api.server/db', async (importOriginal) => {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  return {
    ...(await importOriginal<typeof import('app/api.server/db')>()),
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
afterAll(async () => { });
