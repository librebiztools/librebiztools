import { randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { Result } from 'typescript-result';
import config from '../config';
import { db } from '../db';
import { roles, userWorkspaceRoles, users } from '../db/schema';
import { InputError } from '../errors';
import { getWorkspaceBySlug, sendInviteEmail } from '../workspaces';
import { getUserByEmail } from './get-user-by-email';

// TODO: permissions

export async function addUser({
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
}): Promise<Result<void, InputError>> {
  const name = request.name?.toString().trim();
  const email = request.email?.toString().trim().toLowerCase();

  if (
    !name ||
    name.trim().length < config.USER.MIN_NAME_LENGTH ||
    name.trim().length > config.USER.MAX_NAME_LENGTH
  ) {
    return Result.error(
      new InputError(
        `Name must be between ${config.USER.MIN_NAME_LENGTH} and ${config.USER.MAX_NAME_LENGTH} characters in length`,
      ),
    );
  }

  if (!email) {
    return Result.error(new InputError('Email is required'));
  }

  if (Number.isNaN(roleId)) {
    return Result.error(new InputError('Invalid Role'));
  }

  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    return Result.error(new InputError(`Workspace ${slug} does not exist`));
  }

  const role = await db.query.roles.findFirst({
    where: and(eq(roles.workspaceId, workspace.id), eq(roles.id, roleId)),
  });

  if (!role) {
    return Result.error(new InputError('Role not found'));
  }

  const existingWorkspaceUserRole = await db
    .select({ id: users.id })
    .from(userWorkspaceRoles)
    .innerJoin(
      users,
      and(eq(users.email, email), eq(users.id, userWorkspaceRoles.userId)),
    )
    .where(eq(userWorkspaceRoles.workspaceId, workspace.id));

  if (existingWorkspaceUserRole && existingWorkspaceUserRole.length > 0) {
    return Result.error(
      new InputError(`${email} is already a member of this workspace`),
    );
  }

  const existing = await Result.fromAsync(getUserByEmail(email)).getOrNull();
  if (existing) {
    await db.transaction(async (tx) => {
      await tx.insert(userWorkspaceRoles).values({
        userId: existing.id,
        workspaceId: workspace.id,
        roleId: role.id,
        createdBy: userId,
      });

      await sendInviteEmail({ userId: existing.id, slug, tx });
    });
  } else {
    const emailConfirmationCode = randomBytes(32).toString('hex');
    await db.transaction(async (tx) => {
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
        return Result.error(new Error('Failed to insert user record'));
      }

      const user = userRows[0];

      await tx.insert(userWorkspaceRoles).values({
        userId: user.id,
        workspaceId: workspace.id,
        roleId: role.id,
        createdBy: userId,
      });

      await sendInviteEmail({ userId: user.id, slug, tx });
    });
  }

  return Result.ok();
}
