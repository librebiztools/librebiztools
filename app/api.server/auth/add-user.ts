import { randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import config from '../config';
import { db } from '../db';
import { roles, userWorkspaceRoles, users } from '../db/schema';
import { InputError } from '../errors';
import { getUserByEmail } from './get-user-by-email';
import { getWorkspaceBySlug } from './get-workspace-by-slug';
import { sendInviteEmail } from './send-invite-email';

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
}) {
  const name = request.name?.toString().trim();
  const email = request.email?.toString().trim().toLowerCase();

  if (
    !name ||
    name.trim().length < config.USER.MIN_NAME_LENGTH ||
    name.trim().length > config.USER.MAX_NAME_LENGTH
  ) {
    throw new InputError(
      `Name must be between ${config.USER.MIN_NAME_LENGTH} and ${config.USER.MAX_NAME_LENGTH} characters in length`,
    );
  }

  if (!email) {
    throw new InputError('Email is required');
  }

  if (Number.isNaN(roleId)) {
    throw new InputError('Invalid Role');
  }

  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    throw new InputError(`Workspace ${slug} does not exist`);
  }

  const role = await db.query.roles.findFirst({
    where: and(eq(roles.workspaceId, workspace.id), eq(roles.id, roleId)),
  });

  if (!role) {
    throw new InputError('Role not found');
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
    throw new InputError(`${email} is already a member of this workspace`);
  }

  const existing = await getUserByEmail(email);
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
        throw new Error('Failed to insert user record');
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
}
