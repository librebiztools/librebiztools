import { data } from 'react-router';
import { getUserForRequest, sendSignupEmail } from '~/api.server/auth';
import { AuthError } from '~/api.server/errors';
import type { Route } from './+types/resend-confirm-email';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserForRequest(request);
  if (!user) {
    throw new AuthError('You must be logged in to access this route');
  }

  if (!user.emailConfirmationCode) {
    throw new AuthError('You have already confirmed your email');
  }

  await sendSignupEmail(user.email, user.emailConfirmationCode);

  return data({
    success: true,
  });
}
