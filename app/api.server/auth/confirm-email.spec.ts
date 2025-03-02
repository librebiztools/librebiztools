import { faker } from '@faker-js/faker';
import { expect, test } from 'vitest';
import { getUserByEmail } from '../users';
import { confirmEmail } from './confirm-email';
import { signup } from './signup';

const PASSWORD = 'password';

test('Throw on missing email', async () => {
  const result = await confirmEmail({ email: '', code: 'code' });
  expect(result.error).toBeDefined();
});

test('Throw on missing code', async () => {
  const result = await confirmEmail({
    email: faker.internet.email(),
    code: '',
  });
  expect(result.error).toBeDefined();
});

test('Throw on invalid email', async () => {
  const result = await confirmEmail({
    email: faker.internet.email(),
    code: 'asdf',
  });
  expect(result.error).toBeDefined();
});

test('Throw on invalid code', async () => {
  const email = faker.internet.email().toLowerCase();

  await signup({
    name: faker.person.firstName(),
    workspaceName: faker.company.name(),
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  const result = await confirmEmail({ email, code: 'invalid' });
  expect(result.error).toBeDefined();
});

test('Mark user confirmed with correct code', async () => {
  const email = faker.internet.email().toLowerCase();

  await signup({
    name: faker.person.firstName(),
    workspaceName: faker.company.name(),
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  let user = (await getUserByEmail(email)).getOrThrow();

  (
    await confirmEmail({
      email,
      code: user?.emailConfirmationCode,
    })
  ).getOrThrow();

  user = (await getUserByEmail(email)).getOrThrow();

  expect(user?.emailConfirmed).toBe(true);
  expect(user?.emailConfirmationCode).toBeNull();
});

test('Throw on already confirmed', async () => {
  const email = faker.internet.email();

  await signup({
    name: faker.person.firstName(),
    workspaceName: faker.company.name(),
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  const user = (await getUserByEmail(email)).getOrThrow();

  (
    await confirmEmail({
      email,
      code: user?.emailConfirmationCode,
    })
  ).getOrThrow();

  const result = await confirmEmail({
    email,
    code: user?.emailConfirmationCode,
  });

  expect(result.error).toBeDefined();
});
