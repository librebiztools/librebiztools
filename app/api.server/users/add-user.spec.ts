import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { slugify } from '~/utils/slugify';
import { getRoles, signup } from '../auth';
import config from '../config';
import { db } from '../db';
import { emails } from '../db/schema';
import { templates } from '../email';
import { addUser } from './add-user';
import { getUserByEmail } from './get-user-by-email';

test('Throws on invalid name', async () => {
  expect(
    (
      await addUser({
        userId: 1,
        slug: 'foo-bar',
        roleId: 1,
        email: faker.internet.email(),
        name: undefined,
      })
    ).error,
  ).toBeDefined();

  expect(
    (
      await addUser({
        userId: 1,
        slug: 'foo-bar',
        roleId: 1,
        email: faker.internet.email(),
        name: faker.string.alpha({ length: config.USER.MIN_NAME_LENGTH - 1 }),
      })
    ).error,
  ).toBeDefined();

  expect(
    (
      await addUser({
        userId: 1,
        slug: 'foo-bar',
        roleId: 1,
        email: faker.internet.email(),
        name: faker.string.alpha({ length: config.USER.MAX_NAME_LENGTH + 1 }),
      })
    ).error,
  ).toBeDefined();
});

test('Throws on invalid email', async () => {
  expect(
    (
      await addUser({
        userId: 1,
        slug: 'foo-bar',
        roleId: 1,
        email: undefined,
        name: faker.person.firstName(),
      })
    ).error,
  ).toBeDefined();
});

test('Throws on invalid roleId', async () => {
  expect(
    (
      await addUser({
        userId: 1,
        slug: 'foo-bar',
        roleId: Number.NaN,
        email: faker.internet.email(),
        name: faker.person.firstName(),
      })
    ).error,
  ).toBeDefined();
});

test('Throws on non-existent role', async () => {
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  const { userId } = await signup({
    email: faker.internet.email(),
    workspaceName,
    name: faker.person.firstName(),
    password: 'password',
    confirmPassword: 'password',
  });

  expect(
    (
      await addUser({
        userId,
        slug,
        roleId: 99,
        email: faker.internet.email(),
        name: faker.person.firstName(),
      })
    ).error,
  ).toBeDefined();
});

test('Throw on non-existent workspace', async () => {
  expect(
    (
      await addUser({
        userId: 1,
        slug: slugify(faker.company.name()),
        roleId: 1,
        email: faker.internet.email(),
        name: faker.person.firstName(),
      })
    ).error,
  ).toBeDefined();
});

test('Throw on adding existing member', async () => {
  const email = faker.internet.email();
  const name = faker.person.firstName();
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  const { userId } = await signup({
    email,
    name,
    workspaceName,
    password: 'password',
    confirmPassword: 'password',
  });

  const roles = await getRoles({ slug, userId });

  expect(
    (
      await addUser({
        userId,
        slug,
        roleId: roles[0]?.id,
        email,
        name,
      })
    ).error,
  ).toBeDefined();
});

test('Add new user', async () => {
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  const { userId } = await signup({
    email: faker.internet.email(),
    name: faker.person.firstName(),
    workspaceName,
    password: 'password',
    confirmPassword: 'password',
  });

  const roles = await getRoles({ slug, userId });
  const name = faker.person.firstName();
  const email = faker.internet.email();

  (
    await addUser({
      userId,
      slug,
      roleId: roles[0]?.id,
      email,
      name,
    })
  ).getOrThrow();

  const user = (await getUserByEmail(email)).getOrThrow();

  expect(user.name).toBe(name);

  const emailRecord = await db.query.emails.findFirst({
    where: eq(emails.to, email.toLowerCase()),
    with: {
      template: true,
    },
  });

  expect(emailRecord?.template.templateTypeId).toBe(
    templates.newWorkspaceMemberInvitation.typeId,
  );
});
