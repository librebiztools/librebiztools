import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

type User = typeof users.$inferSelect;

export async function getUserById(id: number): Promise<User | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!row) {
    return null;
  }

  return row;
}
