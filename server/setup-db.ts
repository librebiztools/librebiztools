import { sql } from 'drizzle-orm';
import { db } from '~/api.server/db';
import config from '~/api.server/config';
import { applyMigrations } from '~/api.server/db/migrate';
import { seed } from '~/api.server/db/seed';

export async function setupDb() {
  console.log('Checking if database is up...');

  const up = await isDbUp();
  if (!up) {
    throw new Error(
      `Failed to setup database! Is Postgres running at postgresql://${config.POSTGRES_USER}:********@${config.POSTGRES_HOST}/${config.POSTGRES_DB}`,
    );
  }

  console.log('Database is up! Applying migrations...');

  await applyMigrations();

  console.log('Seeding data...');

  await seed();

  console.log('Database seeded!');
}

async function isDbUp(attempts = 3, timeout = 2000): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      await db.execute(sql`SELECT 1;`);
      return true;
    } catch (err) {
      console.error(`Attempt ${i + 1} failed to connect to SQL server: ${err}`);

      if (i < attempts - 1) {
        await new Promise((res) => setTimeout(res, timeout)); // Wait before retrying
      }
    }
  }
  return false;
}
