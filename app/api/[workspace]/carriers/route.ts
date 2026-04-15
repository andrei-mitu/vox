import { readJsonBody }           from "@/lib/api/request";
import { ApiResponse }            from "@/lib/api/response";
import { assertWorkspaceAccess }  from "@/lib/auth/workspace";
import { parseCreateCarrierBody } from "@/lib/dto/carrier.dto";
import { getSessionUser }         from "@/lib/services/auth.service";
import {
    createNewCarrier,
    getCarriersForTeam,
}                                 from "@/lib/services/carrier.service";

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

        const carriers = await getCarriersForTeam(access.team.id);
        return ApiResponse.ok(carriers);
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

        const parsed = parseCreateCarrierBody(body);
        if ( !parsed.ok ) {
            return ApiResponse.badRequest(parsed.message);
        }

        const result = await createNewCarrier(parsed.data, access.team.id);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok(result.carrier, 201);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}
