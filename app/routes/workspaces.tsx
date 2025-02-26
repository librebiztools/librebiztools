import { redirect } from 'react-router';
import { commitSession, getSession } from '~/api.server/session';
import { getWorkspacesForUser } from '~/api.server/workspace';
import type { Route } from './+types/workspaces';

// TODO: Workspace picker

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  if (url.pathname !== '/workspaces') {
    return;
  }

  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    session.flash('error', 'You must be logged in to access that page');
    return redirect('/login', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  const workspaces = await getWorkspacesForUser({ userId });
  if (!workspaces.length) {
    session.flash('error', "You don't belong to any workspaces");
    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  return redirect(`/workspaces/${workspaces[0].slug}`);
}
