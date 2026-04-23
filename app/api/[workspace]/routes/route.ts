import { readJsonBody }          from "@/lib/api/request";
import { ApiResponse }           from "@/lib/api/response";
import { assertWorkspaceAccess } from "@/lib/auth/workspace";
import { parseCreateRouteBody }  from "@/lib/dto/route.dto";
import { getSessionUser }        from "@/lib/services/auth.service";
import {
    createNewRoute,
    getRoutesForTeam,
}                                from "@/lib/services/route.service";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ workspace: string }> },
): Promise<Response> {
    try {
        const { workspace: slug } = await params;

        const user = await getSessionUser();
        if ( !user ) {
            return ApiResponse.unauthorized();
        }

        const access = await assertWorkspaceAccess(slug, user);
        if ( !access.ok ) {
            return ApiResponse.error("Not found", access.status);
        }

        const routes = await getRoutesForTeam(access.team.id);
        return ApiResponse.ok(routes);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ workspace: string }> },
): Promise<Response> {
    try {
        const { workspace: slug } = await params;

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

        const parsed = parseCreateRouteBody(body);
        if ( !parsed.ok ) {
            return ApiResponse.badRequest(parsed.message);
        }

        const result = await createNewRoute(parsed.data, access.team.id);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok(result.route, 201);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}
