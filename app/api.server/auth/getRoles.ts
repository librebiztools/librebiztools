import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { roles, type roles as rolesType, workspaces } from '../db/schema';

type Role = typeof rolesType.$inferSelect;

export async function getRoles({
  userId: _, // TODO: permissions
  slug,
}: { userId: number; slug: string }): Promise<Role[]> {
  return db
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
