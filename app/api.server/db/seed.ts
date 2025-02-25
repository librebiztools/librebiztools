import { db } from './index';
import { emailTemplates, meta } from './schema';
import { signup, forgotPassword } from './data/emailTemplates';
import { eq } from 'drizzle-orm';

export async function seed() {
  console.info('Seeding database..');

  const seeded = await db.query.meta.findFirst({
    where: eq(meta.key, 'seeded'),
  });

  if (seeded?.value === 'true') {
    console.info('Database already seeded!');
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

  console.info('Database seeded!');
}
