import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const systemRoleEnum = pgEnum('system_role', ['admin', 'user']);
export type SystemRole = typeof systemRoleEnum.enumValues[number];

export const profiles = pgTable('profiles', {
  id:         uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName:   text('full_name').notNull().default(''),
  systemRole: systemRoleEnum('system_role').notNull().default('user'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Profile    = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
