import { randomBytes } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { expect, test } from 'vitest';
import config from '../config';
import { db } from '../db';
import { emails } from '../db/schema';
import { templates } from '../email';
import { sendSignupEmail } from './send-signup-email';

test('Email is created with proper vars', async () => {
  const to = faker.internet.email().toLowerCase();
  const code = randomBytes(32).toString('hex');

  await sendSignupEmail(to, code);

  const email = await db.query.emails.findFirst({
    where: eq(emails.to, to),
  });

  expect(email?.templateId).toBe(templates.signup.typeId);
  expect(email?.vars).toStrictEqual({
    confirmation_link: `${config.BASE_URL}/email-confirmation/confirm?email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`,
  });
});
