import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import config from '../config';
import { db } from '../db';
import { users, workspaces } from '../db/schema';
import { ApiError, InputError } from '../errors';
import { createToken } from './create-token';
import { createWorkspace } from './create-workspace';
import { createHash } from './hash';
import { sendSignupEmail } from './send-signup-email';

interface SignupRequest {
  name: string | null | undefined;
  workspaceName: string | null | undefined;
  email: string | null | undefined;
  password: string | null | undefined;
  confirmPassword: string | null | undefined;
}

export interface SignupResult {
  userId: number;
  token: string;
}

export async function signup(request: SignupRequest): Promise<SignupResult> {
  const name = request.name?.toString().toLowerCase().trim();
  const email = request.email?.toString().toLowerCase().trim();
  const workspaceName = request.workspaceName?.toString().trim();

  if (
    !name ||
    name.length < config.USER.MIN_NAME_LENGTH ||
    name.length > config.USER.MAX_NAME_LENGTH
  ) {
    throw new InputError(
      `Name must be between ${config.USER.MIN_NAME_LENGTH} and ${config.USER.MAX_NAME_LENGTH} characters in length`,
    );
  }

  if (
    !workspaceName ||
    workspaceName.length < config.WORKSPACE.MIN_NAME_LENGTH ||
    workspaceName.length > config.WORKSPACE.MAX_NAME_LENGTH
  ) {
    throw new InputError(
      `Workspace name must be between ${config.WORKSPACE.MIN_NAME_LENGTH} and ${config.WORKSPACE.MAX_NAME_LENGTH} characters in length`,
    );
  }

  if (!email) {
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
    where: eq(users.email, email),
  });

  if (user) {
    throw new InputError('An account with that email already exists');
  }

  const workspace = await db.query.workspaces.findFirst({
    columns: {
      id: true,
    },
    where: eq(workspaces.name, workspaceName),
  });

  if (workspace) {
    throw new InputError('A workspace with that name already exists');
  }

  const hash = await createHash(`${email}${request.password}`);

  try {
    const emailConfirmationCode = randomBytes(32).toString('hex');
    return await db.transaction(async (tx) => {
      const userRows = await tx
        .insert(users)
        .values({
          name,
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

      await createWorkspace({
        userId: user.id,
        name: workspaceName,
        tx,
      });
      await sendSignupEmail(email, emailConfirmationCode, tx);

      const token = await createToken(user.id, tx);

      return {
        userId: user.id,
        token,
      };
    });
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    console.error('Failed to signup new user', err);
    throw new ApiError();
  }
}
