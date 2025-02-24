import { expect, test } from 'vitest';
import { db } from '../db';
import { users } from '../db/schema';
import { AuthError, InputError } from '../errors';
import { confirmEmail } from './confirmEmail';
import { eq } from 'drizzle-orm';
import { signup } from './signup';

const EMAIL = 'user@example.com';
const PASSWORD = 'password';

test('Throw on missing email', async () => {
  await expect(() => confirmEmail({ email: '', code: 'code' })).rejects.toThrow(
    InputError,
  );
});

test('Throw on missing code', async () => {
  await expect(() => confirmEmail({ email: EMAIL, code: '' })).rejects.toThrow(
    InputError,
  );
});

test('Throw on invalid email', async () => {
  await expect(() =>
    confirmEmail({ email: EMAIL, code: 'asdf' }),
  ).rejects.toThrow(AuthError);
});

test('Throw on invalid code', async () => {
  await signup({
    email: EMAIL,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  await expect(() =>
    confirmEmail({ email: EMAIL, code: 'invalid' }),
  ).rejects.toThrow(AuthError);
});

test('Mark user confirmed with correct code', async () => {
  await signup({
    email: EMAIL,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  let user = await db.query.users.findFirst({
    where: eq(users.email, EMAIL),
  });

  await confirmEmail({
    email: EMAIL,
    code: user?.emailConfirmationCode,
  });

  user = await db.query.users.findFirst({
    where: eq(users.email, EMAIL),
  });

  expect(user?.emailConfirmed).toBe(true);
  expect(user?.emailConfirmationCode).toBeNull();
});

test('Throw on already confirmed', async () => {
  await signup({
    email: EMAIL,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  const user = await db.query.users.findFirst({
    where: eq(users.email, EMAIL),
  });

  await confirmEmail({
    email: EMAIL,
    code: user?.emailConfirmationCode,
  });

  await expect(() =>
    confirmEmail({
      email: EMAIL,
      code: user?.emailConfirmationCode,
    }),
  ).rejects.toThrow(AuthError);
});
