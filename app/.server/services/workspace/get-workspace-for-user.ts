import { and, eq } from 'drizzle-orm';
import { None, type Option, Some } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { db } from '~/.server/db';
import { userWorkspaceRoles, workspaces } from '~/.server/db/schema';

type Workspace = typeof workspaces.$inferSelect;

type Request = {
  userId: number;
  slug: string;
};

export async function getWorkspaceForUser(
  { userId, slug }: Request,
  context: Context,
): Promise<Option<Workspace>> {
  const { tx } = context;

  const rows = await (tx || db)
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
    return None;
  }

  return Some(rows[0].workspaces);
}
