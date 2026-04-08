import {and, eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import type {NewTeam, NewTeamMember, Team, TeamMember} from '@/lib/db/schema';
import {teamMembers, teams} from '@/lib/db/schema';

export async function findTeamById(id: string): Promise<Team | null> {
    const rows = await db().select().from(teams).where(eq(teams.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function findTeamBySlug(slug: string): Promise<Team | null> {
    const rows = await db().select().from(teams).where(eq(teams.slug, slug)).limit(1);
    return rows[0] ?? null;
}

export async function findTeamsByUserId(userId: string): Promise<Team[]> {
    return db()
        .select({
            id: teams.id,
            name: teams.name,
            slug: teams.slug,
            logoUrl: teams.logoUrl,
            visibility: teams.visibility,
            createdAt: teams.createdAt,
            updatedAt: teams.updatedAt
        })
        .from(teams)
        .innerJoin(teamMembers, eq(teamMembers.teamId, teams.id))
        .where(eq(teamMembers.userId, userId));
}

export async function createTeam(data: NewTeam): Promise<Team> {
    const rows = await db().insert(teams).values(data).returning();
    return rows[0]!;
}

export async function addTeamMember(data: NewTeamMember): Promise<TeamMember> {
    const rows = await db().insert(teamMembers).values(data).returning();
    return rows[0]!;
}

export async function findMembership(teamId: string, userId: string): Promise<TeamMember | null> {
    const rows = await db()
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
        .limit(1);
    return rows[0] ?? null;
}
