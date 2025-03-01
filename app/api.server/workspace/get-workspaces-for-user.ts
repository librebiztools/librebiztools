import { eq } from 'drizzle-orm';
import { db } from '../db';
import { userWorkspaceRoles, type workspaces } from '../db/schema';

type WorkspaceType = typeof workspaces.$inferSelect;

interface Workspace extends WorkspaceType {
  accepted: boolean;
}

export async function getWorkspacesForUser({
  userId,
}: { userId: number }): Promise<Workspace[]> {
  const rows = await db.query.userWorkspaceRoles.findMany({
    where: eq(userWorkspaceRoles.userId, userId),
    with: {
      workspace: true,
    },
  });

  if (!rows || !rows.length) {
    return [];
  }

  return rows.map((r) => ({
    accepted: r.accepted,
    ...r.workspace,
  }));
}
