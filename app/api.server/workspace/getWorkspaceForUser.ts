import { eq } from 'drizzle-orm';
import { db } from '../db';
import { userWorkspaceRoles, type workspaces } from '../db/schema';

type Workspace = typeof workspaces.$inferSelect;

export async function getWorkspaceForUser({
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

  return rows.map((r) => r.workspace);
}
