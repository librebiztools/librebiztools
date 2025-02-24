import { expect, test } from 'vitest';
import { db } from '../db';
import { emails, users } from '../db/schema';
import { InputError } from '../errors';
import { createHash } from './hash';
import { signup } from './signup';
import { and, eq } from 'drizzle-orm';

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
  const passwordHash = await createHash(`${email}${password}`);
  await db.insert(users).values({ email, passwordHash });

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

test('Send signup email on valid signup', async () => {
  const email = 'user@example.com';
  const password = 'password';

  await signup({ email, password, confirmPassword: password });

  const row = await db.query.emails.findFirst({
    where: and(eq(emails.to, email), eq(emails.templateId, 1)),
  });

  expect(row).toBeDefined();
});
