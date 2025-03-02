import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { emailTemplates, workspaces } from '../db/schema';
import { InputError } from '../errors';
import { SYSTEM_TEMPLATE_IDS } from './email-templates';

export async function getEmailTemplateId({
  typeId,
  slug,
}: {
  typeId: number;
  slug: string;
}): Promise<number> {
  if (SYSTEM_TEMPLATE_IDS.includes(typeId)) {
    return typeId;
  }

  const templates = await db
    .select({ id: emailTemplates.id })
    .from(emailTemplates)
    .innerJoin(
      workspaces,
      and(
        eq(workspaces.id, emailTemplates.workspaceId),
        eq(workspaces.slug, slug),
      ),
    )
    .where(eq(emailTemplates.templateTypeId, typeId));

  if (!templates || !templates.length) {
    throw new InputError(
      `Template with typeId: ${typeId} not found for ${slug}`,
    );
  }

  return templates[0].id;
}
