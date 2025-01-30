import { expect, test } from 'vitest';
import { db } from '../db';
import { AuthError, InputError } from '../errors';
import { users } from '../db/schema';
import { createHash } from './hash';
import { signup } from './signup';

test('Throw on missing email', async () => {
  await expect(() =>
    signup({ email: '', password: 'password', confirmPassword: 'password' }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing password', async () => {
  await expect(() =>
    signup({
      email: 'user@example.com',
      password: '',
      confirmPassword: 'password',
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing confirm password', async () => {
  await expect(() =>
    signup({
      email: 'user@example.com',
      password: 'password',
      confirmPassword: '',
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on mismatched passwords', async () => {
  await expect(() =>
    signup({
      email: 'unique@example.com',
      password: 'password',
      confirmPassword: 'passWORD',
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on existing', async () => {
  const email = 'user@example.com';
  const password = 'password';
  const password_hash = await createHash(`${email}${password}`);
  await db.insert(users).values({ email, password_hash });

  await expect(() =>
    signup({ email, password: 'password', confirmPassword: 'password' }),
  ).rejects.toThrow(InputError);
});

test('Return token on valid signup', async () => {
  const email = 'user@example.com';
  const password = 'password';

  const result = await signup({ email, password, confirmPassword: password });
  expect(result.token).toBeDefined();
});
