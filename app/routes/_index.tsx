import { redirect } from 'react-router';
import { getContext } from '~/.server/context';
import { destroySession } from '~/.server/session';
import type { Route } from './+types/_index';

export async function loader({ request }: Route.LoaderArgs) {
  const { session } = await getContext(request);
  if (session.get('userId')) {
    return redirect('/workspaces');
  }

  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
