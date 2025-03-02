import { type Session, redirect } from 'react-router';
import {
  type SessionData,
  type SessionFlashData,
  commitSession,
} from '~/api.server/session';

export async function errorRedirect(
  session: Session<SessionData, SessionFlashData>,
  message: string,
  url = '/',
) {
  session.flash('error', message);
  return redirect(url, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
