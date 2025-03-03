import { randomBytes } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import { getTestContext } from '~/.server/context';
import { emailTemplates } from '~/.server/data';
import { db } from '../../db';
import { emails } from '../../db/schema';
import { sendSignupEmail } from './send-signup-email';

test('Email is created with proper vars', async () => {
  const context = await getTestContext();
  const to = faker.internet.email().toLowerCase();
  const code = randomBytes(32).toString('hex');

  await sendSignupEmail({ to, code }, context);

  const email = await db.query.emails.findFirst({
    where: eq(emails.to, to),
  });

  const { config } = context;

  expect(email?.templateId).toBe(emailTemplates.signup.typeId);
  expect(email?.vars).toStrictEqual({
    confirmation_link: `${config.BASE_URL}/email-confirmation/confirm?email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`,
  });
});
