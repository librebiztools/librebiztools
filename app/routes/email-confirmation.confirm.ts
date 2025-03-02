import { redirect } from 'react-router';
import { getContext } from '~/.server/context';
import { commitSession } from '~/.server/session';
import type { Route } from './+types/email-confirmation.confirm';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const email = url.searchParams.get('email');
  const code = url.searchParams.get('code');
  const context = await getContext(request);
  const {
    session,
    services: { AuthService },
  } = context;

  await AuthService.confirmEmail({ email, code }, context);
  session.flash('message', 'Email address confirmed!');

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
