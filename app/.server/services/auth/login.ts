import { eq } from 'drizzle-orm';
import { Err, Ok, type Result } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { db } from '~/.server/db';
import { users } from '~/.server/db/schema';
import { type ApiError, AuthError, InputError } from '../../errors';
import { createToken } from './create-token';
import { validateHash } from './hash';

type Request = {
  email: string | undefined;
  password: string | undefined;
};

type Response = {
  userId: number;
  token: string;
};

export async function login(
  request: Request,
  context: Context,
): Promise<Result<Response, ApiError>> {
  const email = request?.email?.toString().toLowerCase().trim();
  if (!email) {
    return Err(new InputError('Email is required'));
  }

  if (!request.password) {
    return Err(new InputError('Password is required'));
  }

  const { tx } = context;

  const user = await (tx || db).query.users.findFirst({
    columns: {
      id: true,
      passwordHash: true,
    },
    where: eq(users.email, email),
  });

  if (!user || !user.passwordHash) {
    // Validate hash anyway to prevent attacker from knowing account doesn't exist
    await validateHash(
      'user@example.compassword',
      '$argon2id$v=19$m=19456,t=2,p=1$H9b2MajnxXAQiBwWoDpxxA$ynOOC0atZ53wuc/G9A/qgJLR85YdXZzRdYNgpNzFs6g',
    );
    return Err(new AuthError());
  }

  const validPassword = await validateHash(
    `${email}${request.password}`,
    user.passwordHash,
  );

  if (!validPassword) {
    throw new AuthError();
  }

  const token = await createToken({ userId: user.id }, context);

  return Ok({
    userId: user.id,
    token,
  });
}
