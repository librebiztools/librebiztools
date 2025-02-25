import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import config from '../config';
import { type TransactionType, db } from '../db';
import { emails, users } from '../db/schema';
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
    const email = request.email;
    const emailConfirmationCode = randomBytes(32).toString('hex');
    return await db.transaction(async (tx) => {
      const userRows = await tx
        .insert(users)
        .values({
          email,
          emailConfirmationCode,
          passwordHash: hash,
        })
        .returning({
          id: users.id,
        });

      if (!userRows || userRows.length === 0) {
        throw new Error('Failed to insert user record');
      }

      const user = userRows[0];

      const token = await createToken(user.id, tx);

      await sendSignupEmail(email, emailConfirmationCode, tx);

      return {
        token,
      };
    });
  } catch (err) {
    console.error('Failed to signup new user', err);
    throw new ApiError();
  }
}

async function sendSignupEmail(
  email: string,
  code: string,
  tx: TransactionType,
) {
  await tx.insert(emails).values({
    to: email,
    templateId: 1,
    vars: {
      confirmation_link: `${config.BASE_URL}/confirm-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
    },
  });
}
