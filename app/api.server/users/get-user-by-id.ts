import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { InputError } from '../errors';

type User = typeof users.$inferSelect;

export async function getUserById(id: number): Promise<User> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!row) {
    throw new InputError('No user with that id found');
  }

  return row;
}
