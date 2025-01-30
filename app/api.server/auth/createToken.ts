import { randomBytes } from 'crypto';
import { db } from '../db';
import { tokens } from '../db/schema';
import config from '../config';

export async function createToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');

  const rows = await db
    .insert(tokens)
    .values({
      user_id: userId,
      max_age: config.SESSION_TIMEOUT_MINUTES * 60,
      token,
    })
    .returning({
      token: tokens.token,
    });

  return rows[0].token;
}
