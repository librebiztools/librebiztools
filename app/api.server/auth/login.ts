import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { ApiError, InputError } from '../errors';
import { AuthError } from '../errors/AuthError';
import { getWorkspaceForUser } from '../workspace';
import { createToken } from './createToken';
import { validateHash } from './hash';

interface LoginRequest {
  email: string | null | undefined;
  password: string | null | undefined;
}

export interface LoginResult {
  token: string;
  slug: string;
}

export async function login(request: LoginRequest): Promise<LoginResult> {
  if (!request.email) {
    throw new InputError('Email is required');
  }

  if (!request.password) {
    throw new InputError('Password is required');
  }

  try {
    const user = await db.query.users.findFirst({
      columns: {
        id: true,
        passwordHash: true,
      },
      where: eq(users.email, request.email),
    });

    if (!user) {
      // Validate hash anyway to prevent attacker from knowing account doesn't exist
      await validateHash(
        'user@example.compassword',
        '$argon2id$v=19$m=19456,t=2,p=1$H9b2MajnxXAQiBwWoDpxxA$ynOOC0atZ53wuc/G9A/qgJLR85YdXZzRdYNgpNzFs6g',
      );
      throw new AuthError();
    }

    const validPassword = await validateHash(
      `${request.email}${request.password}`,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new AuthError();
    }

    const token = await createToken(user.id);

    const workspaces = await getWorkspaceForUser({ userId: user.id });

    // TODO: workspace selector for multiple workspaces
    return {
      token,
      slug: workspaces[0]?.slug,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    console.error('Failed to login', err);
    throw new ApiError();
  }
}
