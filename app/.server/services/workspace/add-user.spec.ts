import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { getTestContext } from '~/.server/context';
import { emailTemplates } from '~/.server/data';
import { InputError } from '~/.server/errors';
import { slugify } from '~/utils/slugify';
import { db } from '../../db';
import { emails } from '../../db/schema';
import { signup } from '../auth';
import { getUserByEmail } from '../user';
import { addUser } from './add-user';
import { getRoles } from './get-roles';

test('Throws on invalid name', async () => {
  const context = await getTestContext();
  const { config } = context;

  expect(
    (
      await addUser(
        {
          userId: 1,
          slug: 'foo-bar',
          roleId: 1,
          email: faker.internet.email(),
          name: undefined,
        },
        context,
      )
    ).unwrapErr(),
  ).toBeInstanceOf(InputError);

  expect(
    (
      await addUser(
        {
          userId: 1,
          slug: 'foo-bar',
          roleId: 1,
          email: faker.internet.email(),
          name: faker.string.alpha({ length: config.USER.MIN_NAME_LENGTH - 1 }),
        },
        context,
      )
    ).unwrapErr(),
  ).toBeInstanceOf(InputError);

  expect(
    (
      await addUser(
        {
          userId: 1,
          slug: 'foo-bar',
          roleId: 1,
          email: faker.internet.email(),
          name: faker.string.alpha({ length: config.USER.MAX_NAME_LENGTH + 1 }),
        },
        context,
      )
    ).unwrapErr(),
  ).toBeInstanceOf(InputError);
});

test('Throws on invalid email', async () => {
  const context = await getTestContext();
  expect(
    (
      await addUser(
        {
          userId: 1,
          slug: 'foo-bar',
          roleId: 1,
          email: undefined,
          name: faker.person.firstName(),
        },
        context,
      )
    ).unwrapErr(),
  ).toBeInstanceOf(InputError);
});

test('Throws on invalid roleId', async () => {
  const context = await getTestContext();
  expect(
    (
      await addUser(
        {
          userId: 1,
          slug: 'foo-bar',
          roleId: Number.NaN,
          email: faker.internet.email(),
          name: faker.person.firstName(),
        },
        context,
      )
    ).unwrapErr(),
  ).toBeInstanceOf(InputError);
});

test('Throws on non-existent role', async () => {
  const context = await getTestContext();
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  const { userId } = (
    await signup(
      {
        email: faker.internet.email(),
        workspaceName,
        name: faker.person.firstName(),
        password: 'password',
        confirmPassword: 'password',
      },
      context,
    )
  ).unwrap();

  expect(
    (
      await addUser(
        {
          userId,
          slug,
          roleId: 99,
          email: faker.internet.email(),
          name: faker.person.firstName(),
        },
        context,
      )
    ).unwrapErr(),
  ).toBeInstanceOf(InputError);
});

test('Throw on non-existent workspace', async () => {
  const context = await getTestContext();
  expect(
    (
      await addUser(
        {
          userId: 1,
          slug: slugify(faker.company.name()),
          roleId: 1,
          email: faker.internet.email(),
          name: faker.person.firstName(),
        },
        context,
      )
    ).unwrapErr(),
  ).toBeInstanceOf(InputError);
});

test('Throw on adding existing member', async () => {
  const context = await getTestContext();
  const email = faker.internet.email();
  const name = faker.person.firstName();
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  const { userId } = (
    await signup(
      {
        email,
        name,
        workspaceName,
        password: 'password',
        confirmPassword: 'password',
      },
      context,
    )
  ).unwrap();

  const roles = await getRoles({ slug, userId }, context);

  expect(
    (
      await addUser(
        {
          userId,
          slug,
          roleId: roles[0]?.id,
          email,
          name,
        },
        context,
      )
    ).unwrapErr(),
  ).toBeInstanceOf(InputError);
});

test('Add new user', async () => {
  const context = await getTestContext();
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  const { userId } = (
    await signup(
      {
        email: faker.internet.email(),
        name: faker.person.firstName(),
        workspaceName,
        password: 'password',
        confirmPassword: 'password',
      },
      context,
    )
  ).unwrap();

  const roles = await getRoles({ slug, userId }, context);
  const name = faker.person.firstName();
  const email = faker.internet.email();

  (
    await addUser(
      {
        userId,
        slug,
        roleId: roles[0]?.id,
        email,
        name,
      },
      context,
    )
  ).unwrap();

  const user = (await getUserByEmail({ email }, context)).unwrap();

  expect(user.name).toBe(name);

  const emailRecord = await db.query.emails.findFirst({
    where: eq(emails.to, email.toLowerCase()),
    with: {
      template: true,
    },
  });

  expect(emailRecord?.template.templateTypeId).toBe(
    emailTemplates.existingWorkspaceMemberInvitation.typeId,
  );
});
