import { faker } from '@faker-js/faker';
import { and, eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { slugify } from '~/utils/slugify';
import { signup } from '../auth';
import { db } from '../db';
import { emailTemplates } from '../db/schema';
import { InputError } from '../errors';
import { getWorkspaceBySlug } from '../workspaces';
import { templates } from './email-templates';
import { getEmailTemplateId } from './get-email-template-id';

test('Returns system template', async () => {
  const templateId = await getEmailTemplateId({ typeId: 1, slug: 'foobar' });
  expect(templateId).toBe(1);
});

test('Returns workspace template', async () => {
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  await signup({
    name: faker.person.firstName(),
    email: faker.internet.email(),
    workspaceName,
    password: 'password',
    confirmPassword: 'password',
  });

  // Will throw if doesn't find template
  await getEmailTemplateId({
    typeId: templates.workspaceMemberRemoval.typeId,
    slug,
  });
});

test('Throws for missing template', async () => {
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  await signup({
    name: faker.person.firstName(),
    email: faker.internet.email(),
    workspaceName,
    password: 'password',
    confirmPassword: 'password',
  });

  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    throw new Error('Could not find workspace');
  }

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

  await expect(async () => {
    await getEmailTemplateId({
      typeId: templates.workspaceMemberRemoval.typeId,
      slug,
    });
  }).rejects.toThrow(InputError);
});
