import {
    bigserial,
    boolean,
    char,
    date,
    index,
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
}                  from "drizzle-orm/pg-core";
import { teams }   from "./teams";
import { users }   from "./users";
import { clients } from "./clients";

export const tripStatusEnum = pgEnum("trip_status", [
    "CREATED",
    "CARRIER_ASSIGNED",
    "MONITORING",
    "AWAITING_PAYMENT",
    "COMPLETED",
]);
export type TripStatus = (typeof tripStatusEnum.enumValues)[number];

export const phytoCostByEnum = pgEnum("phyto_cost_by", [
    "CARRIER",
    "SENDER",
]);
export type PhytoCostBy = (typeof phytoCostByEnum.enumValues)[number];

export const trips = pgTable(
    "trips",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        seqId: bigserial("seq_id", { mode: "number" }).notNull(),
        teamId: uuid("team_id")
            .notNull()
            .references(() => teams.id, { onDelete: "cascade" }),
        createdBy: uuid("created_by")
            .notNull()
            .references(() => users.id),
        status: tripStatusEnum("status").notNull().default("CREATED"),

        cargoName: text("cargo_name").notNull(),
        cargoType: text("cargo_type"),
        weightKg: numeric("weight_kg", { precision: 10, scale: 2 }),
        volumeM3: numeric("volume_m3", { precision: 10, scale: 2 }),
        thermal: boolean("thermal").notNull().default(false),
        tempMin: numeric("temp_min", { precision: 5, scale: 1 }),
        tempMax: numeric("temp_max", { precision: 5, scale: 1 }),
        thermodiagram: boolean("thermodiagram").notNull().default(false),
        adr: boolean("adr").notNull().default(false),
        adrClass: text("adr_class"),
        phytosanitary: boolean("phytosanitary").notNull().default(false),
        phytoCostBy: phytoCostByEnum("phyto_cost_by"),

        clientId: uuid("client_id").references(() => clients.id),
        clientName: text("client_name"),
        contactPerson: text("contact_person"),
        contactPhone: text("contact_phone"),
        contactEmail: text("contact_email"),
        price: numeric("price", { precision: 12, scale: 2 }),
        currency: char("currency", { length: 3 }).notNull().default("EUR"),
        paymentPeriod: integer("payment_period"),

        loadingAddress: text("loading_address"),
        loadingCustoms: text("loading_customs"),
        unloadingAddress: text("unloading_address"),
        unloadingCustoms: text("unloading_customs"),
        loadingDateFrom: date("loading_date_from"),
        loadingDateTo: date("loading_date_to"),

        comments: text("comments"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (t) => [
        index("idx_trips_team_id").on(t.teamId),
        index("idx_trips_status").on(t.status),
        index("idx_trips_created_by").on(t.createdBy),
    ],
);

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
