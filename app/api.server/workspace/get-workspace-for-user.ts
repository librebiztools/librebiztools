import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { userWorkspaceRoles, workspaces } from '../db/schema';

type Workspace = typeof workspaces.$inferSelect;

export async function getWorkspaceForUser({
  userId,
  slug,
}: { userId: number; slug: string }): Promise<Workspace | null> {
  const rows = await db
    .select()
    .from(userWorkspaceRoles)
    .innerJoin(
      workspaces,
      and(
        eq(workspaces.id, userWorkspaceRoles.workspaceId),
        eq(workspaces.slug, slug),
      ),
    )
    .where(eq(userWorkspaceRoles.userId, userId))
    .limit(1);

  if (!rows || !rows.length) {
    return null;
  }

  return rows[0].workspaces;
}
