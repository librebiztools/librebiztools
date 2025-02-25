import { faker } from '@faker-js/faker';
import { and, eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { db } from '../db';
import { emails, users } from '../db/schema';
import { InputError } from '../errors';
import { signup } from './signup';

const PASSWORD = 'PASSWORD';

test('Throw on missing email', async () => {
  await expect(() =>
    signup({
      name: faker.person.firstName(),
      workspaceName: faker.company.name(),
      email: '',
      password: PASSWORD,
      confirmPassword: PASSWORD,
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing name', async () => {
  await expect(() =>
    signup({
      name: '',
      workspaceName: faker.company.name(),
      email: faker.internet.email(),
      password: PASSWORD,
      confirmPassword: PASSWORD,
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing workspace name', async () => {
  await expect(() =>
    signup({
      name: faker.person.firstName(),
      workspaceName: '',
      email: faker.internet.email(),
      password: PASSWORD,
      confirmPassword: PASSWORD,
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing password', async () => {
  await expect(() =>
    signup({
      name: faker.person.firstName(),
      workspaceName: faker.company.name(),
      email: faker.internet.email(),
      password: '',
      confirmPassword: PASSWORD,
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on missing confirm password', async () => {
  await expect(() =>
    signup({
      name: faker.person.firstName(),
      workspaceName: faker.company.name(),
      email: faker.internet.email(),
      password: PASSWORD,
      confirmPassword: '',
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on mismatched passwords', async () => {
  await expect(() =>
    signup({
      name: faker.person.firstName(),
      workspaceName: faker.company.name(),
      email: faker.internet.email(),
      password: PASSWORD,
      confirmPassword: 'wrong',
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on existing user', async () => {
  const name = faker.person.firstName();
  const email = faker.internet.email();

  await signup({
    name,
    workspaceName: faker.company.name(),
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  await expect(() =>
    signup({
      name,
      workspaceName: faker.company.name(),
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    }),
  ).rejects.toThrow(InputError);
});

test('Throw on existing workspace', async () => {
  const workspaceName = faker.company.name();

  await signup({
    name: faker.person.firstName(),
    workspaceName,
    email: faker.internet.email(),
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  await expect(() =>
    signup({
      name: faker.person.firstName(),
      workspaceName: workspaceName,
      email: faker.internet.email(),
      password: PASSWORD,
      confirmPassword: PASSWORD,
    }),
  ).rejects.toThrow(InputError);
});

test('Return token on valid signup', async () => {
  const result = await signup({
    name: faker.person.firstName(),
    workspaceName: faker.company.name(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });
  expect(result.token).toBeDefined();
});

test('Send signup email on valid signup', async () => {
  const email = faker.internet.email();

  await signup({
    name: faker.person.firstName(),
    workspaceName: faker.company.name(),
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  const row = await db.query.emails.findFirst({
    where: and(eq(emails.to, email), eq(emails.templateId, 1)),
  });

  expect(row).toBeDefined();
});

test('Create workspace with default roles on valid signup', async () => {
  const email = faker.internet.email();

  await signup({
    name: faker.person.firstName(),
    workspaceName: faker.company.name(),
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });

  const row = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      workspaces: true,
      roles: true,
    },
  });

  expect(row?.workspaces?.length).toBe(1);
  expect(row?.roles?.length).toBe(1);
});
