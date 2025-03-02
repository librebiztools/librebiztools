import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import config from '../config';
import { db } from '../db';
import { tokens } from '../db/schema';
import { getUserByEmail } from '../users';
import { signup } from './signup';

test('Creates valid token', async () => {
  const email = faker.internet.email();

  await signup({
    name: faker.person.firstName(),
    email,
    password: 'password',
    confirmPassword: 'password',
    workspaceName: faker.company.name(),
  });

  const user = (await getUserByEmail(email)).getOrThrow();

  const token = await db.query.tokens.findFirst({
    where: eq(tokens.userId, user.id),
  });

  expect(token?.maxAge).toBe(config.SESSION_TIMEOUT_MINUTES * 60);
});
