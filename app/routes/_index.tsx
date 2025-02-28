import { redirect } from 'react-router';
import { getUserForRequest } from '~/api.server/auth';
import type { Route } from './+types/_index';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserForRequest(request);
  if (user) {
    return redirect('/workspaces');
  }

  return redirect('/login');
}
