import { and, eq } from 'drizzle-orm';
import type { Context } from '~/.server/context';
import { db } from '~/.server/db';
import { userWorkspaceRoles, users, workspaces } from '~/.server/db/schema';

type Request = {
  userId: number;
};

type Invite = {
  workspaceId: number;
  workspace: string;
  invitedBy: string;
  createdAt: Date;
};

export async function getWorkspaceInvitesForUserId(
  { userId }: Request,
  context: Context,
): Promise<Invite[]> {
  const { tx } = context;

  return (tx || db)
    .select({
      workspaceId: workspaces.id,
      workspace: workspaces.name,
      invitedBy: users.name,
      createdAt: userWorkspaceRoles.createdAt,
    })
    .from(userWorkspaceRoles)
    .innerJoin(users, eq(users.id, userWorkspaceRoles.createdBy))
    .innerJoin(workspaces, eq(workspaces.id, userWorkspaceRoles.workspaceId))
    .where(
      and(
        eq(userWorkspaceRoles.userId, userId),
        eq(userWorkspaceRoles.accepted, false),
      ),
    );
}
