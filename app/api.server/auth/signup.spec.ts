import { faker } from '@faker-js/faker';
import { and, eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { db } from '../db';
import { emails, users } from '../db/schema';
import { InputError } from '../errors';
import { createHash } from './hash';
import { signup } from './signup';

const PASSWORD = 'PASSWORD';

test('Throw on missing email', async () => {
  await expect(() =>
    signup({ email: '', password: PASSWORD, confirmPassword: PASSWORD }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing password', async () => {
  await expect(() =>
    signup({
      email: faker.internet.email(),
      password: '',
      confirmPassword: PASSWORD,
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing confirm password', async () => {
  await expect(() =>
    signup({
      email: faker.internet.email(),
      password: PASSWORD,
      confirmPassword: '',
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on mismatched passwords', async () => {
  await expect(() =>
    signup({
      email: faker.internet.email(),
      password: PASSWORD,
      confirmPassword: 'wrong',
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on existing', async () => {
  const email = faker.internet.email();
  const passwordHash = await createHash(`${email}${PASSWORD}`);
  await db.insert(users).values({ email, passwordHash });

  await expect(() =>
    signup({ email, password: PASSWORD, confirmPassword: PASSWORD }),
  ).rejects.toThrow(InputError);
});

test('Return token on valid signup', async () => {
  const result = await signup({
    email: faker.internet.email(),
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });
  expect(result.token).toBeDefined();
});

test('Send signup email on valid signup', async () => {
  const email = faker.internet.email();

  await signup({
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  const row = await db.query.emails.findFirst({
    where: and(eq(emails.to, email), eq(emails.templateId, 1)),
  });

  expect(row).toBeDefined();
});
