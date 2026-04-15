import { isUniqueViolation } from "@/lib/db/errors";
import type { Team }         from "@/lib/db/schema";
import type {
    CreateTeamInput,
    TeamDto
}                            from "@/lib/dto/team.dto";
import {
    addTeamMember,
    createTeam,
    findAllTeams,
    findTeamBySlug,
    findTeamsByUserId,
}                            from "@/lib/repositories/team.repository";

function toTeamDto(team: Team): TeamDto {
    return {
        id: team.id,
        name: team.name,
        slug: team.slug,
        logoUrl: team.logoUrl ?? null,
        visibility: team.visibility,
    };
}

export async function getTeamsForUser(userId: string): Promise<TeamDto[]> {
    const teams = await findTeamsByUserId(userId);
    return teams.map(toTeamDto);
}

/** Admins see all teams; regular users see only their own memberships. */
export async function getVisibleTeams(
    userId: string,
    role: "admin" | "user",
): Promise<TeamDto[]> {
    const teams =
        role === "admin" ? await findAllTeams() : await findTeamsByUserId(userId);
    return teams.map(toTeamDto);
}

export type CreateTeamSuccess = { ok: true; team: TeamDto };
export type CreateTeamFailure = { ok: false; status: number; message: string };

export async function createNewTeam(
    input: CreateTeamInput,
    ownerId: string,
): Promise<CreateTeamSuccess | CreateTeamFailure> {
    const existing = await findTeamBySlug(input.slug);
    if ( existing ) {
        return {
            ok: false,
            status: 409,
            message: "A team with that slug already exists.",
        };
    }

    try {
        const team = await createTeam({
            name: input.name,
            slug: input.slug,
            visibility: input.visibility,
        });
        await addTeamMember({ teamId: team.id, userId: ownerId, role: "owner" });
        return { ok: true, team: toTeamDto(team) };
    } catch ( err ) {
        if ( isUniqueViolation(err) ) {
            return {
                ok: false,
                status: 409,
                message: "A team with that slug already exists.",
            };
        }
        throw err;
    }
}
