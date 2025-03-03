import { faker } from '@faker-js/faker';
import { expect, test } from 'vitest';
import { AuthError, InputError } from '../errors';
import { login } from './login';
import { signup } from './signup';

const PASSWORD = 'password';

test('Throw on missing email', async () => {
  await expect(() => login({ email: '', password: PASSWORD })).rejects.toThrow(
    InputError,
  );
});

test('Throw on missing password', async () => {
  await expect(() =>
    login({ email: faker.internet.email(), password: '' }),
  ).rejects.toThrow(InputError);
});

test('Throw on non-existing email', async () => {
  await expect(() =>
    login({ email: faker.internet.email(), password: PASSWORD }),
  ).rejects.toThrow(AuthError);
});

test('Throw on invalid password', async () => {
  const email = faker.internet.email();

  await signup({
    name: faker.person.firstName(),
    workspaceName: faker.company.name(),
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  await expect(() => login({ email, password: 'wrong' })).rejects.toThrow(
    AuthError,
  );
});

test('Return token on valid login', async () => {
  const email = faker.internet.email();

  await signup({
    name: faker.person.firstName(),
    workspaceName: faker.company.name(),
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  const result = await login({ email, password: PASSWORD });
  expect(result.token).toBeDefined();
});
