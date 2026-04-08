import { pgTable, uuid, timestamp, pgEnum, unique, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { teams } from './teams';

export const teamRoleEnum = pgEnum('team_role', ['owner', 'logistician']);
export type TeamRole = typeof teamRoleEnum.enumValues[number];

export const teamMembers = pgTable('team_members', {
  id:       uuid('id').primaryKey().defaultRandom(),
  teamId:   uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId:   uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role:     teamRoleEnum('role').notNull().default('logistician'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.teamId, t.userId),
  index('idx_team_members_user_id').on(t.userId),
  index('idx_team_members_team_id').on(t.teamId),
]);

export type TeamMember    = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
