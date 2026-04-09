import {and, eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import type {Carrier, NewCarrier} from '@/lib/db/schema';
import {carriers} from '@/lib/db/schema';

export async function findCarriersByTeamId(teamId: string): Promise<Carrier[]> {
    return db()
        .select()
        .from(carriers)
        .where(eq(carriers.teamId, teamId))
        .orderBy(carriers.name);
}

export async function findCarrierById(id: string, teamId: string): Promise<Carrier | null> {
    const rows = await db()
        .select()
        .from(carriers)
        .where(and(eq(carriers.id, id), eq(carriers.teamId, teamId)))
        .limit(1);
    return rows[0] ?? null;
}

export async function createCarrier(data: NewCarrier): Promise<Carrier> {
    const rows = await db().insert(carriers).values(data).returning();
    return rows[0]!;
}

export async function updateCarrier(
    id: string,
    teamId: string,
    data: Partial<Omit<NewCarrier, 'id' | 'teamId' | 'createdAt'>>,
): Promise<Carrier | null> {
    const rows = await db()
        .update(carriers)
        .set({...data, updatedAt: new Date()})
        .where(and(eq(carriers.id, id), eq(carriers.teamId, teamId)))
        .returning();
    return rows[0] ?? null;
}

export async function deleteCarrier(id: string, teamId: string): Promise<boolean> {
    const rows = await db()
        .delete(carriers)
        .where(and(eq(carriers.id, id), eq(carriers.teamId, teamId)))
        .returning({id: carriers.id});
    return rows.length > 0;
}
