import config from '../config';
import type { TransactionType } from '../db';
import { sendEmail, templates } from '../email';

export async function sendSignupEmail(
  to: string,
  code: string,
  tx?: TransactionType,
) {
  await sendEmail({
    to,
    templateId: templates.signup.typeId,
    vars: {
      confirmation_link: `${config.BASE_URL}/email-confirmation/confirm?email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`,
    },
    tx,
  });
}
