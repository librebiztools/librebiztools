import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

type User = typeof users.$inferSelect;

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!row) {
    return null;
  }

  return row;
}
