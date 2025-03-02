import type { Context } from '~/.server/context';
import { emailTemplates } from '~/.server/data';

type Request = {
  to: string;
  code: string;
};

export async function sendSignupEmail({ to, code }: Request, context: Context) {
  const {
    services: { EmailService },
    config,
  } = context;

  await EmailService.sendEmail(
    {
      to,
      templateId: emailTemplates.signup.typeId,
      vars: {
        confirmation_link: `${
          config.BASE_URL
        }/email-confirmation/confirm?email=${encodeURIComponent(
          to,
        )}&code=${encodeURIComponent(code)}`,
      },
    },
    context,
  );
}
