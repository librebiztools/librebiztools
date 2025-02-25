import { eq } from 'drizzle-orm';
import { forgotPassword, signup } from './data/emailTemplates';
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
      subject: signup.subject,
      body: signup.body,
    },
    {
      subject: forgotPassword.subject,
      body: forgotPassword.body,
    },
  ]);

  await db.insert(meta).values({
    key: 'seeded',
    value: 'true',
  });
}
