import { eq } from 'drizzle-orm';
import {
  FORGOT_PASSWORD_TEMPLATE_ID,
  SIGNUP_TEMPLATE_ID,
  templates,
} from '../email';
import { db } from './index';
import { emailTemplates, meta } from './schema';

export async function seed() {
  const seeded = await db.query.meta.findFirst({
    where: eq(meta.key, 'seeded'),
  });

  if (seeded?.value === 'true') {
    return;
  }

  await db.insert(emailTemplates).values([
    {
      templateTypeId: SIGNUP_TEMPLATE_ID,
      subject: templates.signup.subject,
      body: templates.signup.body,
    },
    {
      templateTypeId: FORGOT_PASSWORD_TEMPLATE_ID,
      subject: templates.forgotPassword.subject,
      body: templates.forgotPassword.body,
    },
  ]);

  await db.insert(meta).values({
    key: 'seeded',
    value: 'true',
  });
}
