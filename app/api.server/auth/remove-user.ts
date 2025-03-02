import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { userWorkspaceRoles, users } from '../db/schema';
import { getEmailTemplateId, sendEmail, templates } from '../email';
import { InputError } from '../errors';
import { getWorkspaceBySlug } from './get-workspace-by-slug';

// TODO: permissions

export async function removeUser({
  userId: _userId,
  slug,
  removeUserId,
}: {
  userId: number;
  slug: string;
  removeUserId: number;
}) {
  if (Number.isNaN(removeUserId)) {
    throw new InputError('Invalid user id');
  }

  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    throw new InputError(`Workspace ${slug} does not exist`);
  }

  const rows = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(userWorkspaceRoles)
    .innerJoin(
      users,
      and(eq(users.id, removeUserId), eq(users.id, userWorkspaceRoles.userId)),
    )
    .where(eq(userWorkspaceRoles.workspaceId, workspace.id));

  if (rows.length === 0) {
    throw new InputError('User is not a member of this workspace');
  }

  const removeUser = rows[0];

  await db.transaction(async (tx) => {
    await tx
      .delete(userWorkspaceRoles)
      .where(
        and(
          eq(userWorkspaceRoles.userId, removeUserId),
          eq(userWorkspaceRoles.workspaceId, workspace.id),
        ),
      );

    await sendEmail({
      to: removeUser.email,
      templateId: await getEmailTemplateId({
        slug,
        typeId: templates.workspaceMemberRemoval.typeId,
      }),
      vars: {
        name: removeUser.name,
        workspace_name: workspace.name,
      },
      tx,
    });
  });
}
