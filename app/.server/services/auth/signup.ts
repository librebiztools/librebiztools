import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { Err, Ok, type Result } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { db } from '~/.server/db';
import { userWorkspaceRoles, users, workspaces } from '~/.server/db/schema';
import { ApiError, InputError } from '../../errors';
import { createWorkspace } from '../workspace';
import { createToken } from './create-token';
import { createHash } from './hash';
import { sendSignupEmail } from './send-signup-email';

type Request = {
  name: string | undefined;
  workspaceName: string | undefined;
  email: string | undefined;
  password: string | undefined;
  confirmPassword: string | undefined;
};

type Response = {
  userId: number;
  token: string;
};

export async function signup(
  request: Request,
  context: Context,
): Promise<Result<Response, ApiError>> {
  const name = request.name?.toString().trim();
  const email = request.email?.toString().toLowerCase().trim();
  const workspaceName = request.workspaceName?.toString().trim();

  const { config, tx } = context;

  if (
    !name ||
    name.length < config.USER.MIN_NAME_LENGTH ||
    name.length > config.USER.MAX_NAME_LENGTH
  ) {
    return Err(
      new InputError(
        `Name must be between ${config.USER.MIN_NAME_LENGTH} and ${config.USER.MAX_NAME_LENGTH} characters in length`,
      ),
    );
  }

  if (!email) {
    return Err(new InputError('Email is required'));
  }

  if (!request.password) {
    return Err(new InputError('Password is required'));
  }

  if (!request.confirmPassword) {
    return Err(new InputError('Confirm password is required'));
  }

  if (request.password !== request.confirmPassword) {
    return Err(new InputError('Passwords do not match'));
  }

  const user = await (tx || db).query.users.findFirst({
    columns: {
      id: true,
      passwordHash: true,
    },
    where: eq(users.email, email),
  });

  const invited = user && !user.passwordHash;

  if (invited) {
    return signupInvitee(
      {
        userId: user.id,
        email,
        password: request.password,
        name,
      },
      context,
    );
  }

  if (user) {
    return Err(new InputError('An account with that email already exists'));
  }

  if (
    !workspaceName ||
    workspaceName.length < config.WORKSPACE.MIN_NAME_LENGTH ||
    workspaceName.length > config.WORKSPACE.MAX_NAME_LENGTH
  ) {
    return Err(
      new InputError(
        `Workspace name must be between ${config.WORKSPACE.MIN_NAME_LENGTH} and ${config.WORKSPACE.MAX_NAME_LENGTH} characters in length`,
      ),
    );
  }

  const workspace = await db.query.workspaces.findFirst({
    columns: {
      id: true,
    },
    where: eq(workspaces.name, workspaceName),
  });

  if (workspace) {
    return Err(new InputError('A workspace with that name already exists'));
  }

  const hash = await createHash(`${email}${request.password}`);

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
      return Err(new ApiError('Failed to insert user record'));
    }

    const user = userRows[0];

    await createWorkspace(
      {
        userId: user.id,
        name: workspaceName,
      },
      { ...context, tx },
    );

    await sendSignupEmail(
      { to: email, code: emailConfirmationCode },
      { ...context, tx },
    );

    const token = await createToken({ userId: user.id }, { ...context, tx });

    return Ok({
      userId: user.id,
      token,
    });
  });
}

type InviteeRequest = {
  userId: number;
  email: string;
  name: string;
  password: string;
};

async function signupInvitee(
  { userId, email, name, password }: InviteeRequest,
  context: Context,
): Promise<Result<Response, ApiError>> {
  const hash = await createHash(`${email}${password}`);

  return await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        name,
        passwordHash: hash,
        updatedBy: userId,
      })
      .where(eq(users.id, userId));

    await tx
      .update(userWorkspaceRoles)
      .set({ accepted: true })
      .where(eq(userWorkspaceRoles.userId, userId));

    const token = await createToken({ userId }, { ...context, tx });

    return Ok({
      userId,
      token,
    });
  });
}
