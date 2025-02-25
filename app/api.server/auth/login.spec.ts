import { expect, test } from 'vitest';
import { db } from '../db';
import { users } from '../db/schema';
import { AuthError, InputError } from '../errors';
import { createHash } from './hash';
import { login } from './login';
import { faker } from '@faker-js/faker';

const PASSWORD = 'password';

test('Throw on missing email', async () => {
  await expect(() => login({ email: '', password: PASSWORD })).rejects.toThrow(
    InputError,
  );
});

test('Throw on missing password', async () => {
  await expect(() =>
    login({ email: faker.internet.email(), password: '' }),
  ).rejects.toThrow(InputError);
});

test('Throw on non-existing email', async () => {
  await expect(() =>
    login({ email: faker.internet.email(), password: PASSWORD }),
  ).rejects.toThrow(AuthError);
});

test('Throw on invalid password', async () => {
  const email = faker.internet.email();
  const passwordHash = await createHash(`${email}${PASSWORD}`);
  await db.insert(users).values({ email, passwordHash });

  await expect(() => login({ email, password: 'wrong' })).rejects.toThrow(
    AuthError,
  );
});

test('Return token on valid login', async () => {
  const email = faker.internet.email();
  const passwordHash = await createHash(`${email}${PASSWORD}`);
  await db.insert(users).values({ email, passwordHash });

  const result = await login({ email, password: PASSWORD });
  expect(result.token).toBeDefined();
});
