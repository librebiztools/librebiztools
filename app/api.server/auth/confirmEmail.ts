import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { AuthError, InputError } from '../errors';
import { getUserByEmail } from './getUserByEmail';

interface ConfirmEmailRequest {
  email: string | null | undefined;
  code: string | null | undefined;
}

export async function confirmEmail({ email, code }: ConfirmEmailRequest) {
  if (!email || !code) {
    throw new InputError('Email address and confirmation code are required');
  }

  const user = await getUserByEmail(email);

  if (!user || user.emailConfirmed || user.emailConfirmationCode !== code) {
    throw new AuthError('Invalid email or confirmation code');
  }

  return await db
    .update(users)
    .set({
      emailConfirmed: true,
      emailConfirmationCode: null,
    })
    .where(eq(users.email, email));
}
