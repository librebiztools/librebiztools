import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { roles, userWorkspaceRoles, users, workspaces } from '../db/schema';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  inviteAccepted: boolean;
};

export async function getUsers({
  userId: _, // TODO: permissions
  slug,
}: { userId: number; slug: string }): Promise<User[]> {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: roles.role,
      inviteAccepted: userWorkspaceRoles.accepted,
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
}
