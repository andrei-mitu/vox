import { readJsonBody }         from '@/lib/api/request';
import { ApiResponse }          from '@/lib/api/response';
import { withWorkspace }        from '@/lib/api/with-workspace';
import { parseUpdateRouteBody } from '@/lib/dto/route.dto';
import { fields }               from '@/lib/validation/fields';
import {
    getRoute,
    removeRoute,
    updateExistingRoute,
}                               from '@/lib/services/route.service';

const isUuid = (v: string) => fields.uuid().safeParse(v).success;

export const GET = withWorkspace(async (_req, { team, params }) => {
    const { routeId } = params;
    if ( !isUuid(routeId) ) {
        return ApiResponse.notFound('Route not found.');
    }

    const route = await getRoute(team.id, routeId);
    if ( !route ) {
        return ApiResponse.notFound('Route not found.');
    }

    return ApiResponse.ok(route);
});

export const PATCH = withWorkspace(async (req, { team, params }) => {
    const { routeId } = params;
    if ( !isUuid(routeId) ) {
        return ApiResponse.notFound('Route not found.');
    }

    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseUpdateRouteBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await updateExistingRoute(routeId, team.id, parsed.data);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.route);
});

export const DELETE = withWorkspace(async (_req, { team, params }) => {
    const { routeId } = params;
    if ( !isUuid(routeId) ) {
        return ApiResponse.notFound('Route not found.');
    }

    const result = await removeRoute(routeId, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(null);
});
