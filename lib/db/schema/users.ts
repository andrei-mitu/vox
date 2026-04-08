import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id:                uuid('id').primaryKey().defaultRandom(),
  email:             text('email').notNull().unique(),
  passwordHash:      text('password_hash').notNull(),
  emailConfirmedAt:  timestamp('email_confirmed_at', { withTimezone: true }),
  bannedUntil:       timestamp('banned_until',       { withTimezone: true }),
  createdAt:         timestamp('created_at',          { withTimezone: true }).notNull().defaultNow(),
  updatedAt:         timestamp('updated_at',          { withTimezone: true }).notNull().defaultNow(),
});

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
