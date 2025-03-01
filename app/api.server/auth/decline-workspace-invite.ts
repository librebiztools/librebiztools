import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { userWorkspaceRoles } from '../db/schema';
import { InputError } from '../errors';

export async function declinetWorkspaceInvite({
  userId,
  workspaceId,
}: {
  userId: number;
  workspaceId: number;
}) {
  if (Number.isNaN(userId)) {
    throw new InputError(`Invalid userId ${userId}`);
  }

  if (Number.isNaN(workspaceId)) {
    throw new InputError(`Invalid workspaceId ${workspaceId}`);
  }

  const role = await db.query.userWorkspaceRoles.findFirst({
    columns: {
      accepted: true,
    },
    where: and(
      eq(userWorkspaceRoles.userId, userId),
      eq(userWorkspaceRoles.workspaceId, workspaceId),
    ),
  });

  if (!role) {
    throw new InputError('Could not find pending invite for that workspace');
  }

  if (role.accepted) {
    throw new InputError('Invite already accepted');
  }

  await db
    .delete(userWorkspaceRoles)
    .where(
      and(
        eq(userWorkspaceRoles.userId, userId),
        eq(userWorkspaceRoles.workspaceId, workspaceId),
      ),
    );
}
