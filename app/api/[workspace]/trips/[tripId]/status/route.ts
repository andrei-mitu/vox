import { readJsonBody }           from '@/lib/api/request';
import { ApiResponse }            from '@/lib/api/response';
import { parseSeqId }             from '@/lib/api/parse-seq-id';
import { withWorkspace }          from '@/lib/api/with-workspace';
import { parseAdvanceStatusBody } from '@/lib/dto/trip.dto';
import { advanceTripStatus }      from '@/lib/services/trip.service';

export const PATCH = withWorkspace(async (req, { team, params }) => {
    const seqId = parseSeqId(params.tripId);
    if ( seqId === null ) {
        return ApiResponse.notFound('Trip not found.');
    }

    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseAdvanceStatusBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await advanceTripStatus(seqId, team.id, parsed.data);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.trip);
});
