import { faker } from '@faker-js/faker';
import { and, eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { getTestContext } from '~/.server/context';
import { db } from '../../db';
import { emails, users } from '../../db/schema';
import { InputError } from '../../errors';
import { signup } from './signup';

const PASSWORD = 'PASSWORD';

test('Throw on missing email', async () => {
  const context = await getTestContext();
  const error = (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
        email: '',
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});

test('Throw on missing name', async () => {
  const context = await getTestContext();
  const error = (
    await signup(
      {
        name: '',
        workspaceName: faker.company.name(),
        email: faker.internet.email(),
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});

test('Throw on missing workspace name', async () => {
  const context = await getTestContext();
  const error = (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: '',
        email: faker.internet.email(),
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});

test('Throw on missing password', async () => {
  const context = await getTestContext();
  const error = (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
        email: faker.internet.email(),
        password: '',
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});

test('Throw on missing confirm password', async () => {
  const context = await getTestContext();
  const error = (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
        email: faker.internet.email(),
        password: PASSWORD,
        confirmPassword: '',
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});

test('Throw on mismatched passwords', async () => {
  const context = await getTestContext();
  const error = (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
        email: faker.internet.email(),
        password: PASSWORD,
        confirmPassword: 'wrong',
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});

test('Throw on existing user', async () => {
  const context = await getTestContext();
  const name = faker.person.firstName();
  const email = faker.internet.email();

  (
    await signup(
      {
        name,
        workspaceName: faker.company.name(),
        email,
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrap();

  const error = (
    await signup(
      {
        name,
        workspaceName: faker.company.name(),
        email,
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});

test('Throw on existing workspace', async () => {
  const context = await getTestContext();
  const workspaceName = faker.company.name();

  (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName,
        email: faker.internet.email(),
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrap();

  const error = (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: workspaceName,
        email: faker.internet.email(),
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrapErr();

  expect(error).toBeInstanceOf(InputError);
});

test('Return token on valid signup', async () => {
  const context = await getTestContext();
  const result = (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
        email: faker.internet.email(),
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrap();

  expect(result.token).toBeDefined();
});

test('Send signup email on valid signup', async () => {
  const context = await getTestContext();
  const email = faker.internet.email();

  (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
        email,
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrap();

  const row = await db.query.emails.findFirst({
    where: and(eq(emails.to, email.toLowerCase()), eq(emails.templateId, 1)),
  });

  expect(row).toBeDefined();
});

test('Create workspace with default roles on valid signup', async () => {
  const context = await getTestContext();
  const email = faker.internet.email();

  (
    await signup(
      {
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
        email,
        password: PASSWORD,
        confirmPassword: PASSWORD,
      },
      context,
    )
  ).unwrap();

  const row = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
    with: {
      workspaces: true,
      roles: true,
    },
  });

  expect(row?.workspaces?.length).toBe(1);
  expect(row?.roles?.length).toBe(1);
});
