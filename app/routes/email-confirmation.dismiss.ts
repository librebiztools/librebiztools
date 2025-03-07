import { redirect } from 'react-router';
import { AuthError } from '~/.server/errors';
import { commitSession } from '~/.server/session';
import { appContext } from '~/app-context';
import type { Route } from './+types/email-confirmation.dismiss';

export async function action({ context, request }: Route.ActionArgs) {
  const ctx = context.get(appContext);
  const { session, user } = ctx;

  if (user.isNone()) {
    throw new AuthError('User not found');
  }

  if (!user.value.emailConfirmationCode) {
    throw new AuthError('You have already confirmed your email');
  }

  session.set('dismissedEmailConfirmation', true);

  return redirect(request.headers.get('referer') || '/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
