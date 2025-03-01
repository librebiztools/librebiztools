import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { userWorkspaceRoles, users, workspaces } from '../db/schema';

type Invite = {
  workspaceId: number;
  workspace: string;
  invitedBy: string;
  createdAt: Date;
};

export async function getWorkspaceInvitesForUserId(
  userId: number,
): Promise<Invite[]> {
  return db
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
