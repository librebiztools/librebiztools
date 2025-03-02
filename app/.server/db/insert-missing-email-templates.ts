import { db } from '.';
import { workspaceEmailTemplates } from '../data';
import { emailTemplates, workspaces } from './schema';

export async function insertMissingEmailTemplates() {
  const workspaceRows = await db
    .select({ id: workspaces.id, createdBy: workspaces.createdBy })
    .from(workspaces);

  const templates = workspaceRows.flatMap((workspace) =>
    workspaceEmailTemplates.map((t) => ({
      workspaceId: workspace.id,
      templateTypeId: t.typeId,
      subject: t.subject,
      body: t.body,
      createdBy: workspace.createdBy,
    })),
  );

  await db.insert(emailTemplates).values(templates).onConflictDoNothing();
}
