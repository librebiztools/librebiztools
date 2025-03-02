import { eq } from 'drizzle-orm';
import { templates } from '../email';
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
      templateTypeId: templates.signup.typeId,
      subject: templates.signup.subject,
      body: templates.signup.body,
    },
    {
      templateTypeId: templates.forgotPassword.typeId,
      subject: templates.forgotPassword.subject,
      body: templates.forgotPassword.body,
    },
  ]);

  await db.insert(meta).values({
    key: 'seeded',
    value: 'true',
  });
}
