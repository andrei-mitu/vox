import {
    and,
    eq,
}                 from "drizzle-orm";
import { db }     from "@/lib/db";
import type {
    NewRoute,
    Route,
}                 from "@/lib/db/schema";
import { routes } from "@/lib/db/schema";

export async function findRoutesByTeamId(teamId: string): Promise<Route[]> {
    return db()
        .select()
        .from(routes)
        .where(eq(routes.teamId, teamId))
        .orderBy(routes.originCity, routes.destCity);
}

export async function findRouteById(
    id: string,
    teamId: string,
): Promise<Route | null> {
    const rows = await db()
        .select()
        .from(routes)
        .where(and(eq(routes.id, id), eq(routes.teamId, teamId)));
    return rows[0] ?? null;
}

export async function findRouteBySeqId(
    seqId: number,
    teamId: string,
): Promise<Route | null> {
    const rows = await db()
        .select()
        .from(routes)
        .where(and(eq(routes.seqId, seqId), eq(routes.teamId, teamId)));
    return rows[0] ?? null;
}

export async function createRoute(data: NewRoute): Promise<Route> {
    const rows = await db().insert(routes).values(data).returning();
    return rows[0]!;
}

export async function updateRoute(
    id: string,
    teamId: string,
    data: Partial<Omit<NewRoute, "id" | "teamId" | "createdAt">>,
): Promise<Route | null> {
    const rows = await db()
        .update(routes)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(routes.id, id), eq(routes.teamId, teamId)))
        .returning();
    return rows[0] ?? null;
}

export async function deleteRoute(
    id: string,
    teamId: string,
): Promise<boolean> {
    const rows = await db()
        .delete(routes)
        .where(and(eq(routes.id, id), eq(routes.teamId, teamId)))
        .returning({ id: routes.id });
    return rows.length > 0;
}
