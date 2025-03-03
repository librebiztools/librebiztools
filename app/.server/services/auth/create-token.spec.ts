import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { getTestContext } from '~/.server/context';
import { db } from '~/.server/db';
import { tokens } from '~/.server/db/schema';
import { getUserByEmail } from '../user';
import { signup } from './signup';

test('Creates valid token', async () => {
  const context = await getTestContext();

  const email = faker.internet.email();

  await signup(
    {
      name: faker.person.firstName(),
      email,
      password: 'password',
      confirmPassword: 'password',
      workspaceName: faker.company.name(),
    },
    context,
  );

  const user = (await getUserByEmail({ email }, context)).unwrap();

  const token = await db.query.tokens.findFirst({
    where: eq(tokens.userId, user.id),
  });

  const { config } = context;

  expect(token?.maxAge).toBe(config.SESSION_TIMEOUT_MINUTES * 60);
});
