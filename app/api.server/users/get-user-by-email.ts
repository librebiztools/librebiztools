import { eq } from 'drizzle-orm';
import { Result } from 'typescript-result';
import { db } from '../db';
import { users } from '../db/schema';
import { InputError } from '../errors';

type User = typeof users.$inferSelect;

export async function getUserByEmail(
  email: string,
): Promise<Result<User, InputError>> {
  const row = await db.query.users.findFirst({
    where: eq(users.email, email.trim().toLowerCase()),
  });

  if (!row) {
    return Result.error(new InputError('User with that email not found'));
  }

  return Result.ok(row);
}
