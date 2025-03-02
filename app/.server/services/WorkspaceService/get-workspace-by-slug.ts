import { eq } from 'drizzle-orm';
import { None, type Option, Some } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { workspaces } from '~/.server/db/schema';

type Workspace = typeof workspaces.$inferSelect;

type Request = {
  slug: string;
};

export async function getWorkspaceBySlug(
  { slug }: Request,
  context: Context,
): Promise<Option<Workspace>> {
  const { db, tx } = context;

  const workspace = await (tx || db).query.workspaces.findFirst({
    where: eq(workspaces.slug, slug),
  });

  if (!workspace) {
    return None;
  }

  return Some(workspace);
}
