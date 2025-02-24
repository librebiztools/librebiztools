import { expect, test } from 'vitest';
import { db } from '../db';
import { users } from '../db/schema';
import { AuthError, InputError } from '../errors';
import { createHash } from './hash';
import { login } from './login';

test('Throw on missing email', async () => {
  await expect(() =>
    login({ email: '', password: 'password' }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing password', async () => {
  await expect(() =>
    login({ email: 'user@example.com', password: '' }),
  ).rejects.toThrow(InputError);
});

test('Throw on non-existing email', async () => {
  await expect(() =>
    login({ email: 'unique@example.com', password: 'password' }),
  ).rejects.toThrow(AuthError);
});

test('Throw on invalid password', async () => {
  const email = 'user@example.com';
  const password = 'password';
  const passwordHash = await createHash(`${email}${password}`);
  await db.insert(users).values({ email, passwordHash });

  await expect(() => login({ email, password: 'wrong' })).rejects.toThrow(
    AuthError,
  );
});

test('Return token on valid login', async () => {
  const email = 'user@example.com';
  const password = 'password';
  const passwordHash = await createHash(`${email}${password}`);
  await db.insert(users).values({ email, passwordHash });

  const result = await login({ email, password });
  expect(result.token).toBeDefined();
});
