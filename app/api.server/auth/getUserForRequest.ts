import { openConnection } from '../db';
import { eq } from 'drizzle-orm';
import { tokens } from '../db/schema';
import { AuthError } from '../errors';
import { parse } from 'cookie';
import type { User } from '~/api/user';

export async function getUserForRequest(
  request: Request,
): Promise<User | null> {
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

  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookie = parse(cookieHeader);
    const cookieToken = cookie['accessToken'];
    if (typeof cookieToken === 'string') {
      return getUserForToken(cookieToken);
    }
  }

  return null;
}

async function getUserForToken(token: string): Promise<User> {
  const db = openConnection();

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
  const createdAt = new Date(record.created_at);
  const diff = Math.abs(now.getTime() - createdAt.getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes > record.max_age) {
    throw new AuthError('Token invalid or expired');
  }

  return {
    id: record.user_id,
    email: record.user.email,
  };
}
