import config from '../config';
import { type TransactionType, db } from '../db';
import { emails } from '../db/schema';

export async function sendSignupEmail(
  email: string,
  code: string,
  tx?: TransactionType,
) {
  await (tx || db).insert(emails).values({
    to: email,
    templateId: 1,
    vars: {
      confirmation_link: `${config.BASE_URL}/confirm-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
    },
  });
}
