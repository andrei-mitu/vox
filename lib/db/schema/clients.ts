import {
    bigserial,
    index,
    pgTable,
    text,
    timestamp,
    uuid,
}                from "drizzle-orm/pg-core";
import { teams } from "./teams";

export const clients = pgTable(
    "clients",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        seqId: bigserial("seq_id", { mode: "number" }).notNull(),
        teamId: uuid("team_id")
            .notNull()
            .references(() => teams.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        contactName: text("contact_name"),
        contactEmail: text("contact_email"),
        contactPhone: text("contact_phone"),
        billingAddress: text("billing_address"),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (t) => [
        index("idx_clients_team_id").on(t.teamId),
    ],
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
