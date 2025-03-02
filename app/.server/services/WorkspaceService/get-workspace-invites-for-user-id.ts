import { and, eq } from 'drizzle-orm';
import type { Context } from '~/.server/context';

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
  const {
    db,
    tx,
    schema: { userWorkspaceRoles, users, workspaces },
  } = context;

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
