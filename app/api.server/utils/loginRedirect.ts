import { type Session, redirect } from 'react-router';
import {
  type SessionData,
  type SessionFlashData,
  commitSession,
} from '~/api.server/session';

export async function loginRedirect(
  session: Session<SessionData, SessionFlashData>,
  returnUrl = '/workspaces',
  message = 'You must be logged in to access that page',
) {
  session.flash('error', message);

  if (returnUrl) {
    session.flash('returnUrl', returnUrl);
  }

  return redirect('/login', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
