import type { Context } from '~/.server/context';
import { db } from '~/.server/db';
import { emails } from '~/.server/db/schema';

export async function sendEmail(
  {
    to,
    templateId,
    vars,
  }: {
    to: string;
    templateId: number;
    vars: object;
  },
  context: Context,
) {
  const { tx } = context;

  await (tx || db).insert(emails).values({
    to,
    templateId,
    vars,
  });
}
