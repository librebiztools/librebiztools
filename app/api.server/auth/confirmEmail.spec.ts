import { expect, test } from 'vitest';
import { db } from '../db';
import { users } from '../db/schema';
import { AuthError, InputError } from '../errors';
import { confirmEmail } from './confirmEmail';
import { eq } from 'drizzle-orm';
import { signup } from './signup';
import { faker } from '@faker-js/faker';

const PASSWORD = 'password';

test('Throw on missing email', async () => {
  await expect(() => confirmEmail({ email: '', code: 'code' })).rejects.toThrow(
    InputError,
  );
});

test('Throw on missing code', async () => {
  await expect(() =>
    confirmEmail({ email: faker.internet.email(), code: '' }),
  ).rejects.toThrow(InputError);
});

test('Throw on invalid email', async () => {
  await expect(() =>
    confirmEmail({ email: faker.internet.email(), code: 'asdf' }),
  ).rejects.toThrow(AuthError);
});

test('Throw on invalid code', async () => {
  const email = faker.internet.email();

  await signup({
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  await expect(() => confirmEmail({ email, code: 'invalid' })).rejects.toThrow(
    AuthError,
  );
});

test('Mark user confirmed with correct code', async () => {
  const email = faker.internet.email();

  await signup({
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  let user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  await confirmEmail({
    email,
    code: user?.emailConfirmationCode,
  });

  user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  expect(user?.emailConfirmed).toBe(true);
  expect(user?.emailConfirmationCode).toBeNull();
});

test('Throw on already confirmed', async () => {
  const email = faker.internet.email();

  await signup({
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  await confirmEmail({
    email,
    code: user?.emailConfirmationCode,
  });

  await expect(() =>
    confirmEmail({
      email,
      code: user?.emailConfirmationCode,
    }),
  ).rejects.toThrow(AuthError);
});
