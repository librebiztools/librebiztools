import { relations } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: int().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password_hash: text().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tokens: many(tokens),
}));

export const tokens = sqliteTable('tokens', {
  user_id: int()
    .notNull()
    .references(() => users.id),
  token: text().notNull(),
  created_at: text().notNull(),
  max_age: int().notNull(),
});

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, { fields: [tokens.user_id], references: [users.id] }),
}));
