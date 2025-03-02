import { redirect } from 'react-router';
import { AuthError } from '~/api.server/errors';
import { commitSession, getSession } from '~/api.server/session';
import { getUserForRequest } from '~/api.server/users';
import type { Route } from './+types/email-confirmation.dismiss';

export async function action({ request }: Route.ActionArgs) {
  const user = await getUserForRequest(request);
  if (!user) {
    throw new AuthError('You must be logged in to access this route');
  }

  if (!user.emailConfirmationCode) {
    throw new AuthError('You have already confirmed your email');
  }

  const session = await getSession(request.headers.get('Cookie'));
  session.set('dismissedEmailConfirmation', true);

  return redirect(request.headers.get('referer') || '/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
