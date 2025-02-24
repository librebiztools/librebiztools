import { randomBytes } from 'node:crypto';
import config from '../config';
import { db, type TransactionType } from '../db';
import { tokens } from '../db/schema';

export async function createToken(
  userId: number,
  transaction?: TransactionType,
): Promise<string> {
  const token = randomBytes(32).toString('hex');

  const rows = await (transaction || db)
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
