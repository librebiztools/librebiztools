import { type TransactionType, db } from '../db';
import { emails } from '../db/schema';

export async function sendEmail({
  to,
  templateId,
  vars,
  tx,
}: {
  to: string;
  templateId: number;
  vars: object;
  tx: TransactionType | undefined;
}) {
  await (tx || db).insert(emails).values({
    to,
    templateId,
    vars,
  });
}
