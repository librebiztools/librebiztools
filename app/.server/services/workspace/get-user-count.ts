import { and, count, eq } from 'drizzle-orm';
import type { Context } from '~/.server/context';
import { db } from '~/.server/db';
import {
  roles,
  userWorkspaceRoles,
  users,
  workspaces,
} from '~/.server/db/schema';

export async function getUserCount(
  {
    userId: _, // TODO: permissions
    slug,
  }: { userId: number; slug: string },
  context: Context,
): Promise<number> {
  const { tx } = context;

  const result = await (tx || db)
    .select({
      count: count(),
    })
    .from(users)
    .innerJoin(userWorkspaceRoles, eq(userWorkspaceRoles.userId, users.id))
    .innerJoin(
      workspaces,
      and(
        eq(workspaces.id, userWorkspaceRoles.workspaceId),
        eq(workspaces.slug, slug),
      ),
    )
    .innerJoin(roles, eq(roles.id, userWorkspaceRoles.roleId));

  if (result.length === 0) {
    return 0;
  }

  return result[0].count;
}
