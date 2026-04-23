import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
}                from "drizzle-orm/pg-core";
import { teams } from "./teams";

export const routes = pgTable(
    "routes",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        teamId: uuid("team_id")
            .notNull()
            .references(() => teams.id, { onDelete: "cascade" }),
        originCity: text("origin_city").notNull(),
        originCountry: text("origin_country").notNull(),
        destCity: text("dest_city").notNull(),
        destCountry: text("dest_country").notNull(),
        distanceKm: integer("distance_km"),
        transitDays: integer("transit_days"),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (t) => [
        index("idx_routes_team_id").on(t.teamId),
    ],
);

export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
