import { readJsonBody }          from '@/lib/api/request';
import { ApiResponse }           from '@/lib/api/response';
import { withWorkspace }         from '@/lib/api/with-workspace';
import { parseUpdateClientBody } from '@/lib/dto/client.dto';
import { fields }                from '@/lib/validation/fields';
import {
    removeClient,
    updateExistingClient,
}                                from '@/lib/services/client.service';

const isUuid = (v: string) => fields.uuid().safeParse(v).success;

export const PATCH = withWorkspace(async (req, { team, params }) => {
    const { clientId } = params;
    if ( !isUuid(clientId) ) {
        return ApiResponse.notFound('Client not found.');
    }

    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseUpdateClientBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await updateExistingClient(clientId, team.id, parsed.data);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.client);
});

export const DELETE = withWorkspace(async (_req, { team, params }) => {
    const { clientId } = params;
    if ( !isUuid(clientId) ) {
        return ApiResponse.notFound('Client not found.');
    }

    const result = await removeClient(clientId, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(null);
});
