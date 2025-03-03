import { faker } from '@faker-js/faker';
import { expect, test } from 'vitest';
import { getTestContext } from '~/.server/context';
import { AuthError, InputError } from '../../errors';
import { login } from './login';
import { signup } from './signup';

const PASSWORD = 'password';

test('Throw on missing email', async () => {
  const context = await getTestContext();
  const error = (
    await login({ email: '', password: PASSWORD }, context)
  ).unwrapErr();
  expect(error).toBeInstanceOf(InputError);
});

test('Throw on missing password', async () => {
  const context = await getTestContext();
  const error = (
    await login({ email: faker.internet.email(), password: '' }, context)
  ).unwrapErr();
  expect(error).toBeInstanceOf(InputError);
});

test('Throw on non-existing email', async () => {
  const context = await getTestContext();
  const error = (
    await login({ email: faker.internet.email(), password: PASSWORD }, context)
  ).unwrapErr();
  expect(error).toBeInstanceOf(AuthError);
});

test('Throw on invalid password', async () => {
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

  const error = (
    await login({ email, password: 'wrong' }, context)
  ).unwrapErr();
  expect(error).toBeInstanceOf(AuthError);
});

test('Return token on valid login', async () => {
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

  const result = (await login({ email, password: PASSWORD }, context)).unwrap();
  expect(result.token).toBeDefined();
});
