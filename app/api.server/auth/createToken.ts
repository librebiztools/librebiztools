import { randomBytes } from 'node:crypto';
import { db } from '../db';
import { tokens } from '../db/schema';
import config from '../config';

export async function createToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');

  const rows = await db
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
