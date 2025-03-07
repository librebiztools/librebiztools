import { redirect } from 'react-router';
import { sendSignupEmail } from '~/.server/services/auth';
import { commitSession } from '~/.server/session';
import { appContext } from '~/app-context';
import type { Route } from './+types/email-confirmation.resend';

export async function action({ context, request }: Route.ActionArgs) {
  const ctx = context.get(appContext);
  const { session, user } = ctx;

  if (user.isNone()) {
    session.flash('error', 'User not found');
  } else {
    if (!user.value.emailConfirmationCode) {
      session.flash('error', 'You have already confirmed your email');
    } else {
      await sendSignupEmail(
        { to: user.value.email, code: user.value.emailConfirmationCode },
        ctx,
      );

      session.set('dismissedEmailConfirmation', true);
    }
  }

  return redirect(request.headers.get('referer') || '/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
