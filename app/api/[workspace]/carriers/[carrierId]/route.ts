import { readJsonBody }           from '@/lib/api/request';
import { ApiResponse }            from '@/lib/api/response';
import { parseSeqId }             from '@/lib/api/parse-seq-id';
import { withWorkspace }          from '@/lib/api/with-workspace';
import { parseUpdateCarrierBody } from '@/lib/dto/carrier.dto';
import {
    removeCarrier,
    updateExistingCarrier,
}                                 from '@/lib/services/carrier.service';

export const PATCH = withWorkspace(async (req, { team, params }) => {
    const seqId = parseSeqId(params.carrierId);
    if ( seqId === null ) {
        return ApiResponse.notFound('Carrier not found.');
    }

    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseUpdateCarrierBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await updateExistingCarrier(seqId, team.id, parsed.data);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.carrier);
});

export const DELETE = withWorkspace(async (_req, { team, params }) => {
    const seqId = parseSeqId(params.carrierId);
    if ( seqId === null ) {
        return ApiResponse.notFound('Carrier not found.');
    }

    const result = await removeCarrier(seqId, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(null);
});
