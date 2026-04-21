import { readJsonBody }         from "@/lib/api/request";
import { ApiResponse }          from "@/lib/api/response";
import { assertWorkspaceAccess } from "@/lib/auth/workspace";
import { parseCreateClientBody } from "@/lib/dto/client.dto";
import { getSessionUser }       from "@/lib/services/auth.service";
import {
    createNewClient,
    getClientsForTeam,
    searchClientsForTeam,
}                               from "@/lib/services/client.service";

export async function GET(
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

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.trim();

        const clients = query
            ? await searchClientsForTeam(access.team.id, query)
            : await getClientsForTeam(access.team.id);

        return ApiResponse.ok(clients);
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

        const parsed = parseCreateClientBody(body);
        if ( !parsed.ok ) {
            return ApiResponse.badRequest(parsed.message);
        }

        const result = await createNewClient(parsed.data, access.team.id);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok(result.client, 201);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}
