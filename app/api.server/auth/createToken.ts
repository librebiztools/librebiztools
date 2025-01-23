import { randomBytes } from 'crypto';
import { openConnection } from '../db';
import { tokens } from '../db/schema';
import config from '../config';
import { sql } from 'drizzle-orm';

export async function createToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const db = openConnection();

  const rows = await db
    .insert(tokens)
    .values({
      user_id: userId,
      max_age: config.SESSION_TIMEOUT_MINUTES * 60,
      token,
      created_at: sql`datetime('now')`,
    })
    .returning({
      token: tokens.token,
    });

  return rows[0].token;
}
