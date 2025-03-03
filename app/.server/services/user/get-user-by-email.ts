import { eq } from 'drizzle-orm';
import { None, type Option, Some } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { db } from '~/.server/db';
import { users } from '~/.server/db/schema';

type User = typeof users.$inferSelect;

type Request = {
  email: string;
};

export async function getUserByEmail(
  { email }: Request,
  context: Context,
): Promise<Option<User>> {
  const { tx } = context;

  const row = await (tx || db).query.users.findFirst({
    where: eq(users.email, email.trim().toLowerCase()),
  });

  if (!row) {
    return None;
  }

  return Some(row);
}
