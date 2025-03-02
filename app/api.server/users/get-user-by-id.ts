import { eq } from 'drizzle-orm';
import { Result } from 'typescript-result';
import { db } from '../db';
import { users } from '../db/schema';
import { InputError } from '../errors';

type User = typeof users.$inferSelect;

export async function getUserById(
  id: number,
): Promise<Result<User, InputError>> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!row) {
    return Result.error(new InputError('No user with that id found'));
  }

  return Result.ok(row);
}
