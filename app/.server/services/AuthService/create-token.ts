import { randomBytes } from 'node:crypto';
import type { Context } from '~/.server/context';
import config from '../../config';

export async function createToken(
  { userId }: { userId: number },
  context: Context,
): Promise<string> {
  const token = randomBytes(32).toString('hex');

  const {
    db,
    tx,
    schema: { tokens },
  } = context;

  const rows = await (tx || db)
    .insert(tokens)
    .values({
      userId,
      maxAge: config.SESSION_TIMEOUT_MINUTES * 60,
      token,
    })
    .returning({
      token: tokens.token,
    });

  return rows[0].token;
}
