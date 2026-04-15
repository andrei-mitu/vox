import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
}                from "drizzle-orm/pg-core";
import { users } from "./users";

export const accessRequestStatusEnum = pgEnum("access_request_status", [
    "pending",
    "approved",
    "rejected",
]);
export type AccessRequestStatus =
    (typeof accessRequestStatusEnum.enumValues)[number];

export const accessRequests = pgTable(
    "access_requests",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        email: text("email").notNull(),
        fullName: text("full_name").notNull(),
        companyName: text("company_name").notNull(),
        message: text("message"),
        status: accessRequestStatusEnum("status").notNull().default("pending"),
        reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
        reviewedBy: uuid("reviewed_by").references(() => users.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (t) => [
        index("idx_access_requests_status").on(t.status),
        index("idx_access_requests_email").on(t.email),
        index("idx_access_requests_reviewed_by").on(t.reviewedBy),
    ],
);

export type AccessRequest = typeof accessRequests.$inferSelect;
export type NewAccessRequest = typeof accessRequests.$inferInsert;
