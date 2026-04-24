import { readJsonBody }        from '@/lib/api/request';
import { ApiResponse }         from '@/lib/api/response';
import { parseSeqId }          from '@/lib/api/parse-seq-id';
import { withWorkspace }       from '@/lib/api/with-workspace';
import { parseUpdateTripBody } from '@/lib/dto/trip.dto';
import {
    getTrip,
    removeTrip,
    updateExistingTrip,
}                              from '@/lib/services/trip.service';

export const GET = withWorkspace(async (_req, { team, params }) => {
    const seqId = parseSeqId(params.tripId);
    if ( seqId === null ) {
        return ApiResponse.notFound('Trip not found.');
    }

    const trip = await getTrip(team.id, seqId);
    if ( !trip ) {
        return ApiResponse.notFound('Trip not found.');
    }

    return ApiResponse.ok(trip);
});

export const PATCH = withWorkspace(async (req, { team, params }) => {
    const seqId = parseSeqId(params.tripId);
    if ( seqId === null ) {
        return ApiResponse.notFound('Trip not found.');
    }

    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseUpdateTripBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await updateExistingTrip(seqId, team.id, parsed.data);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.trip);
});

export const DELETE = withWorkspace(async (_req, { team, params }) => {
    const seqId = parseSeqId(params.tripId);
    if ( seqId === null ) {
        return ApiResponse.notFound('Trip not found.');
    }

    const result = await removeTrip(seqId, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(null);
});
