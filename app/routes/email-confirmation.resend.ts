import { redirect } from 'react-router';
import { getContext } from '~/.server/context';
import { loginRedirect } from '~/.server/helpers';
import { sendSignupEmail } from '~/.server/services/auth';
import { getUserById } from '~/.server/services/user';
import { commitSession } from '~/.server/session';
import type { Route } from './+types/email-confirmation.resend';

export async function action({ request }: Route.ActionArgs) {
  const context = await getContext(request);
  const { session } = context;

  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session);
  }

  const user = await getUserById({ id: userId }, context);

  if (user.isNone()) {
    session.flash('error', 'User not found');
  } else {
    if (!user.value.emailConfirmationCode) {
      session.flash('error', 'You have already confirmed your email');
    } else {
      await sendSignupEmail(
        { to: user.value.email, code: user.value.emailConfirmationCode },
        context,
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
