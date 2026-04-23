import { readJsonBody }          from '@/lib/api/request';
import { ApiResponse }           from '@/lib/api/response';
import { withWorkspace }         from '@/lib/api/with-workspace';
import { parseCreateClientBody } from '@/lib/dto/client.dto';
import {
    createNewClient,
    getClientsForTeam,
    searchClientsForTeam,
}                                from '@/lib/services/client.service';

export const GET = withWorkspace(async (req, { team }) => {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    const clients = query
        ? await searchClientsForTeam(team.id, query)
        : await getClientsForTeam(team.id);

    return ApiResponse.ok(clients);
});

export const POST = withWorkspace(async (req, { team }) => {
    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseCreateClientBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await createNewClient(parsed.data, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.client, 201);
});
