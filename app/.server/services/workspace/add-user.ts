import { randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { Err, Ok, type Result } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { db } from '../../db';
import { roles, userWorkspaceRoles, users } from '../../db/schema';
import { ApiError, InputError } from '../../errors';
import { getUserByEmail } from '../user';
import { getWorkspaceBySlug } from './get-workspace-by-slug';
import { sendInviteEmail } from './send-invite-email';

export async function addUser(
  {
    userId,
    slug,
    roleId,
    ...request
  }: {
    userId: number;
    slug: string;
    name: string | undefined;
    email: string | undefined;
    roleId: number;
  },
  context: Context,
): Promise<Result<void, InputError>> {
  const name = request.name?.toString().trim();
  const email = request.email?.toString().trim().toLowerCase();

  const { config } = context;

  if (
    !name ||
    name.trim().length < config.USER.MIN_NAME_LENGTH ||
    name.trim().length > config.USER.MAX_NAME_LENGTH
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

  if (Number.isNaN(roleId)) {
    return Err(new InputError('Invalid Role'));
  }

  const workspace = await getWorkspaceBySlug({ slug }, context);

  if (workspace.isNone()) {
    return Err(new InputError(`Workspace ${slug} does not exist`));
  }

  const role = await db.query.roles.findFirst({
    where: and(eq(roles.workspaceId, workspace.value.id), eq(roles.id, roleId)),
  });

  if (!role) {
    return Err(new InputError('Role not found'));
  }

  const existingWorkspaceUserRole = await db
    .select({ id: users.id })
    .from(userWorkspaceRoles)
    .innerJoin(
      users,
      and(eq(users.email, email), eq(users.id, userWorkspaceRoles.userId)),
    )
    .where(eq(userWorkspaceRoles.workspaceId, workspace.value.id));

  if (existingWorkspaceUserRole && existingWorkspaceUserRole.length > 0) {
    return Err(
      new InputError(`${email} is already a member of this workspace`),
    );
  }

  const existing = await getUserByEmail({ email }, context);
  if (existing.isSome()) {
    return await db.transaction(async (tx) => {
      await tx.insert(userWorkspaceRoles).values({
        userId: existing.value.id,
        workspaceId: workspace.value.id,
        roleId: role.id,
        createdBy: userId,
      });

      const result = await sendInviteEmail(
        { userId: existing.value.id, slug },
        { ...context, tx },
      );
      if (result.isErr()) {
        return Err(result.error);
      }

      return Ok.EMPTY;
    });
  }

  const emailConfirmationCode = randomBytes(32).toString('hex');

  return await db.transaction(async (tx) => {
    const userRows = await tx
      .insert(users)
      .values({
        name,
        email,
        emailConfirmationCode,
        createdBy: userId,
      })
      .returning({ id: users.id });

    if (!userRows || userRows.length === 0) {
      return Err(new ApiError('Failed to insert user record'));
    }

    const user = userRows[0];

    await tx.insert(userWorkspaceRoles).values({
      userId: user.id,
      workspaceId: workspace.value.id,
      roleId: role.id,
      createdBy: userId,
    });

    const result = await sendInviteEmail(
      { userId: user.id, slug },
      { ...context, tx },
    );

    if (result.isErr()) {
      return Err(result.error);
    }

    return Ok.EMPTY;
  });
}
