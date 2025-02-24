import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { ApiError, InputError } from '../errors';
import { createToken } from './createToken';
import { createHash } from './hash';

interface SignupRequest {
  email: string | null | undefined;
  password: string | null | undefined;
  confirmPassword: string | null | undefined;
}

export interface SignupResult {
  token: string;
}

export async function signup(request: SignupRequest): Promise<SignupResult> {
  if (!request.email) {
    throw new InputError('Email is required');
  }

  if (!request.password) {
    throw new InputError('Password is required');
  }

  if (!request.confirmPassword) {
    throw new InputError('Confirm password is required');
  }

  if (request.password !== request.confirmPassword) {
    throw new InputError('Passwords do not match');
  }

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.email, request.email),
  });

  if (user) {
    throw new InputError('An account with that email already exists');
  }

  const hash = await createHash(`${request.email}${request.password}`);

  try {
    const userRows = await db
      .insert(users)
      .values({
        email: request.email,
        passwordHash: hash,
      })
      .returning({
        id: users.id,
      });

    if (!userRows || userRows.length === 0) {
      throw new Error('Failed to insert user record');
    }

    const user = userRows[0];

    const token = await createToken(user.id);

    return {
      token,
    };
  } catch (err) {
    console.error('Failed to signup new user', err);
    throw new ApiError();
  }
}
