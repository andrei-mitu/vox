import { z }                     from "zod";
import { readJsonBody }          from "@/lib/api/request";
import { ApiResponse }           from "@/lib/api/response";
import { assertWorkspaceAccess } from "@/lib/auth/workspace";
import { parseUpdateRouteBody }  from "@/lib/dto/route.dto";
import { getSessionUser }        from "@/lib/services/auth.service";
import {
    getRoute,
    removeRoute,
    updateExistingRoute,
}                                from "@/lib/services/route.service";

const uuidSchema = z.string().uuid();

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ workspace: string; routeId: string }> },
): Promise<Response> {
    try {
        const { workspace: slug, routeId } = await params;

        if ( !uuidSchema.safeParse(routeId).success ) {
            return ApiResponse.notFound("Route not found.");
        }

        const user = await getSessionUser();
        if ( !user ) {
            return ApiResponse.unauthorized();
        }

        const access = await assertWorkspaceAccess(slug, user);
        if ( !access.ok ) {
            return ApiResponse.error("Not found", access.status);
        }

        const route = await getRoute(access.team.id, routeId);
        if ( !route ) {
            return ApiResponse.notFound("Route not found.");
        }

        return ApiResponse.ok(route);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ workspace: string; routeId: string }> },
): Promise<Response> {
    try {
        const { workspace: slug, routeId } = await params;

        if ( !uuidSchema.safeParse(routeId).success ) {
            return ApiResponse.notFound("Route not found.");
        }

        const user = await getSessionUser();
        if ( !user ) {
            return ApiResponse.unauthorized();
        }

        const access = await assertWorkspaceAccess(slug, user);
        if ( !access.ok ) {
            return ApiResponse.error("Not found", access.status);
        }

        const body = await readJsonBody(request);
        if ( body === null ) {
            return ApiResponse.badRequest("Invalid JSON body");
        }

        const parsed = parseUpdateRouteBody(body);
        if ( !parsed.ok ) {
            return ApiResponse.badRequest(parsed.message);
        }

        const result = await updateExistingRoute(routeId, access.team.id, parsed.data);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok(result.route);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ workspace: string; routeId: string }> },
): Promise<Response> {
    try {
        const { workspace: slug, routeId } = await params;

        if ( !uuidSchema.safeParse(routeId).success ) {
            return ApiResponse.notFound("Route not found.");
        }

        const user = await getSessionUser();
        if ( !user ) {
            return ApiResponse.unauthorized();
        }

        const access = await assertWorkspaceAccess(slug, user);
        if ( !access.ok ) {
            return ApiResponse.error("Not found", access.status);
        }

        const result = await removeRoute(routeId, access.team.id);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok(null);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}
