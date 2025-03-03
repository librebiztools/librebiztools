import { faker } from '@faker-js/faker';
import { expect, test } from 'vitest';
import { getTestContext } from '~/.server/context';
import { InputError } from '~/.server/errors';
import { getUserByEmail } from '../user';
import { confirmEmail } from './confirm-email';
import { signup } from './signup';

const PASSWORD = 'password';

test('Throw on missing email', async () => {
  const context = await getTestContext();
  const result = await confirmEmail({ email: '', code: 'code' }, context);
  expect(result.isErr()).toBe(true);
});

test('Throw on missing code', async () => {
  const context = await getTestContext();
  const result = await confirmEmail(
    {
      email: faker.internet.email(),
      code: '',
    },
    context,
  );
  expect(result.isErr()).toBe(true);
});

test('Throw on invalid email', async () => {
  const context = await getTestContext();
  const result = await confirmEmail(
    {
      email: faker.internet.email(),
      code: 'asdf',
    },
    context,
  );
  expect(result.isErr()).toBe(true);
});

test('Throw on invalid code', async () => {
  const context = await getTestContext();
  const email = faker.internet.email().toLowerCase();

  await signup(
    {
      name: faker.person.firstName(),
      workspaceName: faker.company.name(),
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    },
    context,
  );

  const result = await confirmEmail({ email, code: 'invalid' }, context);
  expect(result.isErr()).toBe(true);
});

test('Mark user confirmed with correct code', async () => {
  const context = await getTestContext();
  const email = faker.internet.email().toLowerCase();

  await signup(
    {
      name: faker.person.firstName(),
      workspaceName: faker.company.name(),
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    },
    context,
  );

  let user = (await getUserByEmail({ email }, context)).unwrap();

  (
    await confirmEmail(
      {
        email,
        code: user.emailConfirmationCode,
      },
      context,
    )
  ).unwrap();

  user = (await getUserByEmail({ email }, context)).unwrap();

  expect(user.emailConfirmed).toBe(true);
  expect(user.emailConfirmationCode).toBeNull();
});

test('Throw on already confirmed', async () => {
  const context = await getTestContext();
  const email = faker.internet.email();

  await signup(
    {
      name: faker.person.firstName(),
      workspaceName: faker.company.name(),
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    },
    context,
  );

  const user = (await getUserByEmail({ email }, context)).unwrap();

  (
    await confirmEmail(
      {
        email,
        code: user.emailConfirmationCode,
      },
      context,
    )
  ).unwrap();

  const error = (
    await confirmEmail(
      {
        email,
        code: user.emailConfirmationCode,
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});
