import { eq } from 'drizzle-orm';
import { Result } from 'typescript-result';
import { db } from '../db';
import { users } from '../db/schema';
import { InputError } from '../errors';
import { getUserByEmail } from '../users';

interface ConfirmEmailRequest {
  email: string | null | undefined;
  code: string | null | undefined;
}

export async function confirmEmail(
  request: ConfirmEmailRequest,
): Promise<Result<void, InputError>> {
  const email = request.email?.toLowerCase().trim();
  if (!email || !request.code) {
    return Result.error(
      new InputError('Email address and confirmation code are required'),
    );
  }

  const [user, error] = await Result.fromAsync(getUserByEmail(email)).toTuple();
  if (error) {
    return Result.error(error);
  }

  if (user.emailConfirmed || user.emailConfirmationCode !== request.code) {
    return Result.error(new InputError('Invalid email or confirmation code'));
  }

  await db
    .update(users)
    .set({
      emailConfirmed: true,
      emailConfirmationCode: null,
    })
    .where(eq(users.email, email));

  return Result.ok();
}
