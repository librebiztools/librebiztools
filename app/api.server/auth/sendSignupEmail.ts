import config from '../config';
import type { TransactionType } from '../db';
import { SIGNUP_TEMPLATE_ID, sendEmail } from '../email';

export async function sendSignupEmail(
  to: string,
  code: string,
  tx?: TransactionType,
) {
  await sendEmail({
    to,
    templateId: SIGNUP_TEMPLATE_ID,
    vars: {
      confirmation_link: `${config.BASE_URL}/email-confirmation/confirm?email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`,
    },
    tx,
  });
}
