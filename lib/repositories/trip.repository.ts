import {
    and,
    desc,
    eq,
    ilike,
    or,
}                from "drizzle-orm";
import { db }    from "@/lib/db";
import type {
    NewTrip,
    Trip,
    TripStatus,
}                from "@/lib/db/schema";
import { trips } from "@/lib/db/schema";

export interface TripFilters {
    status?: TripStatus;
    search?: string;
}

export async function findTripBySeqId(
    seqId: number,
    teamId: string,
): Promise<Trip | null> {
    const rows = await db()
        .select()
        .from(trips)
        .where(and(eq(trips.seqId, seqId), eq(trips.teamId, teamId)));
    return rows[0] ?? null;
}

export async function findTripsByTeamId(
    teamId: string,
    filters: TripFilters = {},
): Promise<Trip[]> {
    const conditions = [eq(trips.teamId, teamId)];

    if ( filters.status ) {
        conditions.push(eq(trips.status, filters.status));
    }
    if ( filters.search ) {
        const pattern = `%${ filters.search }%`;
        conditions.push(
            or(
                ilike(trips.cargoName, pattern),
                ilike(trips.clientName, pattern),
            )!,
        );
    }

    return db()
        .select()
        .from(trips)
        .where(and(...conditions))
        .orderBy(desc(trips.createdAt));
}

export async function createTrip(data: NewTrip): Promise<Trip> {
    const rows = await db().insert(trips).values(data).returning();
    return rows[0]!;
}

export async function updateTrip(
    seqId: number,
    teamId: string,
    data: Partial<Omit<NewTrip, "id" | "seqId" | "teamId" | "createdBy" | "createdAt">>,
): Promise<Trip | null> {
    const rows = await db()
        .update(trips)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(trips.seqId, seqId), eq(trips.teamId, teamId)))
        .returning();
    return rows[0] ?? null;
}

export async function deleteTrip(
    seqId: number,
    teamId: string,
): Promise<boolean> {
    const rows = await db()
        .delete(trips)
        .where(and(eq(trips.seqId, seqId), eq(trips.teamId, teamId)))
        .returning({ id: trips.id });
    return rows.length > 0;
}

export async function updateTripStatus(
    seqId: number,
    teamId: string,
    status: TripStatus,
): Promise<Trip | null> {
    const rows = await db()
        .update(trips)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(trips.seqId, seqId), eq(trips.teamId, teamId)))
        .returning();
    return rows[0] ?? null;
}
