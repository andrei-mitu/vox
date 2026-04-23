import type { Route } from "@/lib/db/schema";
import type {
    CreateRouteInput,
    RouteDto,
    UpdateRouteInput,
}                     from "@/lib/dto/route.dto";
import {
    createRoute,
    deleteRoute,
    findRouteById,
    findRoutesByTeamId,
    updateRoute,
}                     from "@/lib/repositories/route.repository";

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function toRouteDto(route: Route): RouteDto {
    return {
        id: route.id,
        teamId: route.teamId,
        originCity: route.originCity,
        originCountry: route.originCountry,
        destCity: route.destCity,
        destCountry: route.destCountry,
        distanceKm: route.distanceKm,
        transitDays: route.transitDays,
        notes: route.notes,
        createdAt: route.createdAt.toISOString(),
        updatedAt: route.updatedAt.toISOString(),
    };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getRoutesForTeam(teamId: string): Promise<RouteDto[]> {
    const rows = await findRoutesByTeamId(teamId);
    return rows.map(toRouteDto);
}

export async function getRoute(
    teamId: string,
    routeId: string,
): Promise<RouteDto | null> {
    const row = await findRouteById(routeId, teamId);
    return row ? toRouteDto(row) : null;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export type RouteSuccess = { ok: true; route: RouteDto };
export type RouteFailure = { ok: false; status: number; message: string };

export async function createNewRoute(
    input: CreateRouteInput,
    teamId: string,
): Promise<RouteSuccess | RouteFailure> {
    const route = await createRoute({
        teamId,
        originCity: input.originCity,
        originCountry: input.originCountry,
        destCity: input.destCity,
        destCountry: input.destCountry,
        distanceKm: input.distanceKm ?? null,
        transitDays: input.transitDays ?? null,
        notes: input.notes ?? null,
    });
    return { ok: true, route: toRouteDto(route) };
}

export async function updateExistingRoute(
    id: string,
    teamId: string,
    input: UpdateRouteInput,
): Promise<RouteSuccess | RouteFailure> {
    const patch: Parameters<typeof updateRoute>[2] = {};
    if ( input.originCity !== undefined ) {
        patch.originCity = input.originCity;
    }
    if ( input.originCountry !== undefined ) {
        patch.originCountry = input.originCountry;
    }
    if ( input.destCity !== undefined ) {
        patch.destCity = input.destCity;
    }
    if ( input.destCountry !== undefined ) {
        patch.destCountry = input.destCountry;
    }
    if ( input.distanceKm !== undefined ) {
        patch.distanceKm = input.distanceKm ?? null;
    }
    if ( input.transitDays !== undefined ) {
        patch.transitDays = input.transitDays ?? null;
    }
    if ( input.notes !== undefined ) {
        patch.notes = input.notes ?? null;
    }

    const route = await updateRoute(id, teamId, patch);
    if ( !route ) {
        return { ok: false, status: 404, message: "Route not found." };
    }
    return { ok: true, route: toRouteDto(route) };
}

export async function removeRoute(
    id: string,
    teamId: string,
): Promise<{ ok: true } | RouteFailure> {
    const deleted = await deleteRoute(id, teamId);
    if ( !deleted ) {
        return { ok: false, status: 404, message: "Route not found." };
    }
    return { ok: true };
}
