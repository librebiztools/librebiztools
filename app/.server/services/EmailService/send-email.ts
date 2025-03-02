import type { Context } from '~/.server/context';

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
  const {
    db,
    tx,
    schema: { emails },
  } = context;

  await (tx || db).insert(emails).values({
    to,
    templateId,
    vars,
  });
}
