import { redirect } from 'react-router';
import { confirmEmail } from '~/api.server/auth';
import { ApiError } from '~/api.server/errors';
import { commitSession, getSession } from '~/api.server/session';
import type { Route } from './+types/confirm-email';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const email = url.searchParams.get('email');
  const code = url.searchParams.get('code');
  const session = await getSession(request.headers.get('Cookie'));

  try {
    await confirmEmail({ email, code });
    session.flash('message', 'Email address confirmed!');
  } catch (err) {
    if (err instanceof ApiError) {
      session.flash('error', `Error confirming email address: ${err.message}`);
    } else {
      throw err;
    }
  }

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
