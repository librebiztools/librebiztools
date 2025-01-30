import { sql } from 'drizzle-orm';
import { db } from '~/api.server/db';

export async function reset() {
  await db.execute(sql`drop schema if exists public cascade`);
  await db.execute(sql`create schema public`);
  await db.execute(sql`drop schema if exists drizzle cascade`);
}
