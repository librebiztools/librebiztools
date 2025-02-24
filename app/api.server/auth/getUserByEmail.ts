import type { User } from '~/api/user';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!row) {
    return null;
  }

  return row;
}
