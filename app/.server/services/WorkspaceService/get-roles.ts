import { and, eq } from 'drizzle-orm';
import type { Context } from '~/.server/context';
import type { roles as rolesType } from '../../db/schema';

type Role = typeof rolesType.$inferSelect;

export async function getRoles(
  {
    userId: _, // TODO: permissions
    slug,
  }: { userId: number; slug: string },
  context: Context,
): Promise<Role[]> {
  const {
    db,
    tx,
    schema: { roles, workspaces },
  } = context;

  return (tx || db)
    .select({
      id: roles.id,
      workspaceId: roles.workspaceId,
      role: roles.role,
      createdAt: roles.createdAt,
      createdBy: roles.createdBy,
      updatedAt: roles.updatedAt,
      updatedBy: roles.updatedBy,
    })
    .from(roles)
    .innerJoin(
      workspaces,
      and(eq(workspaces.id, roles.workspaceId), eq(workspaces.slug, slug)),
    );
}
