import { redirect } from 'react-router';
import { getSession } from '~/api.server/session';
import { errorRedirect, loginRedirect } from '~/api.server/utils';
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
    return loginRedirect(session);
  }

  const workspaces = await getWorkspacesForUser({ userId });
  if (!workspaces.length) {
    return errorRedirect(session, "You don't belong to any workspaces");
  }

  return redirect(`/workspaces/${workspaces[0].slug}`);
}
