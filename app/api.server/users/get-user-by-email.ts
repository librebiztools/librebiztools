import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { InputError } from '../errors';

type User = typeof users.$inferSelect;

export async function getUserByEmail(email: string): Promise<User> {
  const row = await db.query.users.findFirst({
    where: eq(users.email, email.trim().toLowerCase()),
  });

  if (!row) {
    throw new InputError('User with that email not found');
  }

  return row;
}
