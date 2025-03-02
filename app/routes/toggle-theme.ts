import { redirect } from 'react-router';
import { commitPreferences, getPreferences } from '~/.server/preferences';
import type { Route } from './+types/toggle-theme';

export async function action({ request }: Route.ActionArgs) {
  const preferences = await getPreferences(request.headers.get('Cookie'));
  if (preferences.get('theme') === 'dark') {
    preferences.set('theme', 'light');
  } else {
    preferences.set('theme', 'dark');
  }

  return redirect(request.headers.get('referer') || '/', {
    headers: {
      'Set-Cookie': await commitPreferences(preferences),
    },
  });
}
