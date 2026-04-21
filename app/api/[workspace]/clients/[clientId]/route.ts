import { z }                    from "zod";
import { readJsonBody }         from "@/lib/api/request";
import { ApiResponse }          from "@/lib/api/response";
import { assertWorkspaceAccess } from "@/lib/auth/workspace";
import { parseUpdateClientBody } from "@/lib/dto/client.dto";
import { getSessionUser }       from "@/lib/services/auth.service";
import {
    removeClient,
    updateExistingClient,
}                               from "@/lib/services/client.service";

const uuidSchema = z.string().uuid();

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ workspace: string; clientId: string }> },
): Promise<Response> {
    try {
        const { workspace: slug, clientId } = await params;

        if ( !uuidSchema.safeParse(clientId).success ) {
            return ApiResponse.notFound("Client not found.");
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

        const parsed = parseUpdateClientBody(body);
        if ( !parsed.ok ) {
            return ApiResponse.badRequest(parsed.message);
        }

        const result = await updateExistingClient(clientId, access.team.id, parsed.data);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok(result.client);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ workspace: string; clientId: string }> },
): Promise<Response> {
    try {
        const { workspace: slug, clientId } = await params;

        if ( !uuidSchema.safeParse(clientId).success ) {
            return ApiResponse.notFound("Client not found.");
        }

        const user = await getSessionUser();
        if ( !user ) {
            return ApiResponse.unauthorized();
        }

        const access = await assertWorkspaceAccess(slug, user);
        if ( !access.ok ) {
            return ApiResponse.error("Not found", access.status);
        }

        const result = await removeClient(clientId, access.team.id);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok(null);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}
