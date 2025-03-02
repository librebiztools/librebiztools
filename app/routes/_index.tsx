import { redirect } from 'react-router';
import { ApiError } from '~/api.server/errors';
import { destroySession, getSession } from '~/api.server/session';
import { getUserForRequest } from '~/api.server/users';
import type { Route } from './+types/_index';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  try {
    const user = await getUserForRequest(request);
    if (user) {
      return redirect('/workspaces');
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return redirect('/login', {
        headers: {
          'Set-Cookie': await destroySession(session),
        },
      });
    }
  }
  return redirect('/login');
}
