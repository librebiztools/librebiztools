import { eq } from 'drizzle-orm';
import { None, type Option, Some } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { db } from '~/.server/db';
import { users } from '../../db/schema';

type User = typeof users.$inferSelect;

export async function getUserById(
  { id }: { id: number },
  context: Context,
): Promise<Option<User>> {
  const { tx } = context;

  const row = await (tx || db).query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!row) {
    return None;
  }

  return Some(row);
}
