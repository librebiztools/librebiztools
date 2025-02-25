import { redirect } from 'react-router';
import { destroySession, getSession } from '~/api.server/session';
import type { Route } from './+types/logout';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
