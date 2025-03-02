import { eq } from 'drizzle-orm';
import { db } from '../db';
import { tokens, type users } from '../db/schema';
import { AuthError } from '../errors';
import { getSession } from '../session';

type User = typeof users.$inferSelect;

export async function getUserForRequest(
  request: Request,
): Promise<User | undefined> {
  const url = new URL(request.url);
  const urlToken = url.searchParams.get('accessToken');
  if (urlToken && urlToken.length !== 0) {
    return getUserForToken(urlToken);
  }

  const authorizationToken = request.headers.get('Authorization');
  if (authorizationToken && authorizationToken.length !== 0) {
    return getUserForToken(
      authorizationToken.substring(authorizationToken.indexOf(' ') + 1),
    );
  }

  const session = await getSession(request.headers.get('Cookie'));
  const cookieToken = session.get('accessToken');
  if (cookieToken) {
    return getUserForToken(cookieToken);
  }
}

async function getUserForToken(token: string): Promise<User> {
  const record = await db.query.tokens.findFirst({
    where: eq(tokens.token, token),
    with: {
      user: true,
    },
  });

  if (!record) {
    throw new AuthError('Token invalid or expired');
  }

  const now = new Date();
  const createdAt = new Date(record.createdAt);
  const diff = Math.abs(now.getTime() - createdAt.getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes > record.maxAge) {
    throw new AuthError('Token invalid or expired');
  }

  return record.user;
}
