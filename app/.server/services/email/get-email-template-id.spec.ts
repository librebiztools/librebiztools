import { faker } from '@faker-js/faker';
import { and, eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { getTestContext } from '~/.server/context';
import { emailTemplates as templates } from '~/.server/data';
import { slugify } from '~/utils/slugify';
import { db } from '../../db';
import { emailTemplates } from '../../db/schema';
import { signup } from '../auth';
import { getWorkspaceBySlug } from '../workspace';
import { getEmailTemplateId } from './get-email-template-id';

test('Returns system template', async () => {
  const context = await getTestContext();
  const templateId = (
    await getEmailTemplateId(
      {
        typeId: 1,
        slug: 'foobar',
      },
      context,
    )
  ).unwrap();
  expect(templateId).toBe(1);
});

test('Returns workspace template', async () => {
  const context = await getTestContext();
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  (
    await signup(
      {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        workspaceName,
        password: 'password',
        confirmPassword: 'password',
      },
      context,
    )
  ).unwrap();

  // Will throw if doesn't find template
  (
    await getEmailTemplateId(
      {
        typeId: templates.workspaceMemberRemoval.typeId,
        slug,
      },
      context,
    )
  ).unwrap();
});

test('Return None for missing template', async () => {
  const context = await getTestContext();
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  (
    await signup(
      {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        workspaceName,
        password: 'password',
        confirmPassword: 'password',
      },
      context,
    )
  ).unwrap();

  const workspace = (await getWorkspaceBySlug({ slug }, context)).unwrap();

  await db
    .delete(emailTemplates)
    .where(
      and(
        eq(emailTemplates.workspaceId, workspace.id),
        eq(
          emailTemplates.templateTypeId,
          templates.workspaceMemberRemoval.typeId,
        ),
      ),
    );

  const template = await getEmailTemplateId(
    {
      typeId: templates.workspaceMemberRemoval.typeId,
      slug,
    },
    context,
  );

  expect(template.isNone()).toBe(true);
});
