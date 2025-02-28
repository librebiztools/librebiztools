import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { emailTemplates, workspaces } from '../db/schema';
import { InputError } from '../errors';
import { SYSTEM_TEMPLATE_IDS } from './email-templates';

export async function getEmailTemplateId({
  templateId,
  slug,
}: {
  templateId: number;
  slug: string;
}): Promise<number> {
  if (SYSTEM_TEMPLATE_IDS.includes(templateId)) {
    return templateId;
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
    .where(eq(emailTemplates.templateTypeId, templateId));

  if (!templates || !templates.length) {
    throw new InputError(`Template id: ${templateId} not found for ${slug}`);
  }

  return templates[0].id;
}
