import { redirect } from 'react-router';
import { getContext } from '~/.server/context';
import { AuthError } from '~/.server/errors';
import { loginRedirect } from '~/.server/helpers';
import { getUserById } from '~/.server/services/user';
import { commitSession } from '~/.server/session';
import type { Route } from './+types/email-confirmation.dismiss';

export async function action({ request }: Route.ActionArgs) {
  const context = await getContext(request);
  const { session } = context;

  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session);
  }

  const user = await getUserById({ id: userId }, context);

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
