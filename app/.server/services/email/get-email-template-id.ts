import { and, eq } from 'drizzle-orm';
import { None, type Option, Some } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { SYSTEM_TEMPLATE_IDS as SYSTEM_EMAIL_TEMPLATE_IDS } from '~/.server/data';
import { db } from '~/.server/db';
import { emailTemplates, workspaces } from '~/.server/db/schema';

type Request = {
  typeId: number;
  slug: string;
};

export async function getEmailTemplateId(
  { typeId, slug }: Request,
  context: Context,
): Promise<Option<number>> {
  if (SYSTEM_EMAIL_TEMPLATE_IDS.includes(typeId)) {
    return Some(typeId);
  }

  const { tx } = context;

  const templates = await (tx || db)
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
    return None;
  }

  return Some(templates[0].id);
}
