import { expect, test } from 'vitest';
import { login } from './login';
import { db } from '../db';
import { AuthError, InputError } from '../errors';
import { users } from '../db/schema';
import { createHash } from './hash';

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
  const password_hash = await createHash(`${email}${password}`);
  await db.insert(users).values({ email, password_hash });

  await expect(() => login({ email, password: 'wrong' })).rejects.toThrow(
    AuthError,
  );
});

test('Return token on valid login', async () => {
  const email = 'user@example.com';
  const password = 'password';
  const password_hash = await createHash(`${email}${password}`);
  await db.insert(users).values({ email, password_hash });

  const result = await login({ email, password });
  expect(result.token).toBeDefined();
});
