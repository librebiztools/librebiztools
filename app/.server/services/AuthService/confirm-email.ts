import { eq } from 'drizzle-orm';
import { Err, Ok, type Result } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { InputError } from '~/.server/errors';

type Request = {
  email: string | null | undefined;
  code: string | null | undefined;
};

export async function confirmEmail(
  { email, code }: Request,
  context: Context,
): Promise<Result<void, InputError>> {
  if (!email || !code) {
    return Err(
      new InputError('Email address and confirmation code are required'),
    );
  }

  const {
    db,
    tx,
    schema: { users },
    services: { UserService },
  } = context;

  const user = await UserService.getUserByEmail({ email }, context);
  if (user.isNone()) {
    return Err(new InputError('User not found'));
  }

  if (user.value.emailConfirmed || user.value.emailConfirmationCode !== code) {
    return Err(new InputError('Invalid email or confirmation code'));
  }

  await (tx || db)
    .update(users)
    .set({
      emailConfirmed: true,
      emailConfirmationCode: null,
    })
    .where(eq(users.email, email));

  return Ok.EMPTY;
}
