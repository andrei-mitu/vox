import {
    and,
    eq,
    ilike,
    or
}                  from "drizzle-orm";
import { db }      from "@/lib/db";
import type {
    Client,
    NewClient
}                  from "@/lib/db/schema";
import { clients } from "@/lib/db/schema";

export async function findClientsByTeamId(teamId: string): Promise<Client[]> {
    return db()
        .select()
        .from(clients)
        .where(eq(clients.teamId, teamId))
        .orderBy(clients.name);
}

export async function findClientById(
    id: string,
    teamId: string,
): Promise<Client | null> {
    const rows = await db()
        .select()
        .from(clients)
        .where(and(eq(clients.id, id), eq(clients.teamId, teamId)));
    return rows[0] ?? null;
}

export async function findClientBySeqId(
    seqId: number,
    teamId: string,
): Promise<Client | null> {
    const rows = await db()
        .select()
        .from(clients)
        .where(and(eq(clients.seqId, seqId), eq(clients.teamId, teamId)));
    return rows[0] ?? null;
}

export async function searchClients(
    teamId: string,
    query: string,
): Promise<Client[]> {
    const term = `%${query}%`;
    return db()
        .select()
        .from(clients)
        .where(
            and(
                eq(clients.teamId, teamId),
                or(
                    ilike(clients.name, term),
                    ilike(clients.contactName, term),
                ),
            ),
        )
        .orderBy(clients.name);
}

export async function createClient(data: NewClient): Promise<Client> {
    const rows = await db().insert(clients).values(data).returning();
    return rows[0]!;
}

export async function updateClient(
    id: string,
    teamId: string,
    data: Partial<Omit<NewClient, "id" | "teamId" | "createdAt">>,
): Promise<Client | null> {
    const rows = await db()
        .update(clients)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(clients.id, id), eq(clients.teamId, teamId)))
        .returning();
    return rows[0] ?? null;
}

export async function deleteClient(
    id: string,
    teamId: string,
): Promise<boolean> {
    const rows = await db()
        .delete(clients)
        .where(and(eq(clients.id, id), eq(clients.teamId, teamId)))
        .returning({ id: clients.id });
    return rows.length > 0;
}
