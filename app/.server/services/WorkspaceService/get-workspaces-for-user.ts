import { eq } from 'drizzle-orm';
import type { Context } from '~/.server/context';
import type { workspaces } from '~/.server/db/schema';

type WorkspaceType = typeof workspaces.$inferSelect;

interface Workspace extends WorkspaceType {
  accepted: boolean;
}

type Request = {
  userId: number;
};

export async function getWorkspacesForUser(
  { userId }: Request,
  context: Context,
): Promise<Workspace[]> {
  const {
    db,
    tx,
    schema: { userWorkspaceRoles },
  } = context;
  const rows = await (tx || db).query.userWorkspaceRoles.findMany({
    where: eq(userWorkspaceRoles.userId, userId),
    with: {
      workspace: true,
    },
  });

  return rows.map((r) => ({
    accepted: r.accepted,
    ...r.workspace,
  }));
}
