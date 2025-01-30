import { relations } from 'drizzle-orm';
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 254 }).notNull().unique(),
  password_hash: varchar({ length: 100 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tokens: many(tokens),
}));

export const tokens = pgTable('tokens', {
  user_id: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar({ length: 64 }).notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  max_age: integer().notNull(),
});

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, { fields: [tokens.user_id], references: [users.id] }),
}));
