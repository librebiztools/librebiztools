import { eq } from 'drizzle-orm';
import { db } from '../db';
import { workspaces } from '../db/schema';

type Workspace = typeof workspaces.$inferSelect;

export async function getWorkspaceBySlug(
  slug: string,
): Promise<Workspace | undefined> {
  return db.query.workspaces.findFirst({
    where: eq(workspaces.slug, slug),
  });
}
