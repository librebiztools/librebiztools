import { sql } from 'drizzle-orm';
import { db } from '~/api.server/db';
import { applyMigrations } from './migrate';
import { signup, forgotPassword } from './data/emailTemplates';
import { emailTemplates } from './schema';

export async function reset() {
  await db.execute(sql`drop schema if exists public cascade`);
  await db.execute(sql`create schema public`);
  await db.execute(sql`drop schema if exists drizzle cascade`);

  await applyMigrations();

  await db.insert(emailTemplates).values([
    {
      subject: signup.subject,
      body: signup.body,
    },
    {
      subject: forgotPassword.subject,
      body: forgotPassword.body,
    },
  ]);
}
