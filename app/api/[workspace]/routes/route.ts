import { readJsonBody }         from '@/lib/api/request';
import { ApiResponse }          from '@/lib/api/response';
import { withWorkspace }        from '@/lib/api/with-workspace';
import { parseCreateRouteBody } from '@/lib/dto/route.dto';
import {
    createNewRoute,
    getRoutesForTeam,
}                               from '@/lib/services/route.service';

export const GET = withWorkspace(async (_req, { team }) => {
    const routes = await getRoutesForTeam(team.id);
    return ApiResponse.ok(routes);
});

export const POST = withWorkspace(async (req, { team }) => {
    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseCreateRouteBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await createNewRoute(parsed.data, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.route, 201);
});
