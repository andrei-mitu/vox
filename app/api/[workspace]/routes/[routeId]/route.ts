import { readJsonBody }         from '@/lib/api/request';
import { ApiResponse }          from '@/lib/api/response';
import { parseSeqId }           from '@/lib/api/parse-seq-id';
import { withWorkspace }        from '@/lib/api/with-workspace';
import { parseUpdateRouteBody } from '@/lib/dto/route.dto';
import {
    getRoute,
    removeRoute,
    updateExistingRoute,
}                               from '@/lib/services/route.service';

export const GET = withWorkspace(async (_req, { team, params }) => {
    const seqId = parseSeqId(params.routeId);
    if ( seqId === null ) {
        return ApiResponse.notFound('Route not found.');
    }

    const route = await getRoute(team.id, seqId);
    if ( !route ) {
        return ApiResponse.notFound('Route not found.');
    }

    return ApiResponse.ok(route);
});

export const PATCH = withWorkspace(async (req, { team, params }) => {
    const seqId = parseSeqId(params.routeId);
    if ( seqId === null ) {
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

    const result = await updateExistingRoute(seqId, team.id, parsed.data);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.route);
});

export const DELETE = withWorkspace(async (_req, { team, params }) => {
    const seqId = parseSeqId(params.routeId);
    if ( seqId === null ) {
        return ApiResponse.notFound('Route not found.');
    }

    const result = await removeRoute(seqId, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(null);
});
