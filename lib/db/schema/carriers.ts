import {index, pgEnum, pgTable, text, timestamp, unique, uuid} from 'drizzle-orm/pg-core';
import {teams} from './teams';

export const carrierModeEnum = pgEnum('carrier_mode', ['air', 'ocean', 'road', 'rail']);
export type CarrierMode = typeof carrierModeEnum.enumValues[number];

export const carrierStatusEnum = pgEnum('carrier_status', ['active', 'inactive']);
export type CarrierStatus = typeof carrierStatusEnum.enumValues[number];

export const carriers = pgTable('carriers', {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id').notNull().references(() => teams.id, {onDelete: 'cascade'}),
    name: text('name').notNull(),
    code: text('code').notNull(),
    mode: carrierModeEnum('mode').notNull(),
    status: carrierStatusEnum('status').notNull().default('active'),
    contactName: text('contact_name'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    notes: text('notes'),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
}, (t) => [
    unique('carriers_team_code_unique').on(t.teamId, t.code),
    index('idx_carriers_team_id').on(t.teamId),
    index('idx_carriers_status').on(t.status),
]);

export type Carrier = typeof carriers.$inferSelect;
export type NewCarrier = typeof carriers.$inferInsert;
