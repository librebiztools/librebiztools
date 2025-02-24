import { relations } from 'drizzle-orm';
import {
  integer,
  json,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 254 }).notNull().unique(),
  password_hash: varchar({ length: 100 }).notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  created_by: integer(),
  updated_at: timestamp({ withTimezone: true }).$onUpdateFn(() => new Date()),
  updated_by: integer(),
});

export const usersRelations = relations(users, ({ one }) => ({
  created_by_user: one(users, {
    fields: [users.created_by],
    references: [users.id],
  }),
  updated_by_user: one(users, {
    fields: [users.updated_by],
    references: [users.id],
  }),
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

export const emailTemplates = pgTable('email_templates', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  subject: text().notNull(),
  body: text().notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  created_by: integer()
    .notNull()
    .references(() => users.id),
  updated_at: timestamp({ withTimezone: true }).$onUpdateFn(() => new Date()),
  updated_by: integer().references(() => users.id),
});

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  created_by_user: one(users, {
    fields: [emailTemplates.created_by],
    references: [users.id],
  }),
  updated_by_user: one(users, {
    fields: [emailTemplates.updated_by],
    references: [users.id],
  }),
}));

export const emails = pgTable('emails', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  template_id: integer()
    .notNull()
    .references(() => emailTemplates.id),
  vars: json(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  created_by: integer()
    .notNull()
    .references(() => users.id),
  updated_at: timestamp({ withTimezone: true }).$onUpdateFn(() => new Date()),
  updated_by: integer().references(() => users.id),
});

export const emailsRelations = relations(emails, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [emails.template_id],
    references: [emailTemplates.id],
  }),
  created_by_user: one(users, {
    fields: [emails.created_by],
    references: [users.id],
  }),
  updated_by_user: one(users, {
    fields: [emails.updated_by],
    references: [users.id],
  }),
}));
