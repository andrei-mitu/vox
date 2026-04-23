import { readJsonBody }           from '@/lib/api/request';
import { ApiResponse }            from '@/lib/api/response';
import { withWorkspace }          from '@/lib/api/with-workspace';
import { parseUpdateCarrierBody } from '@/lib/dto/carrier.dto';
import { fields }                 from '@/lib/validation/fields';
import {
    removeCarrier,
    updateExistingCarrier,
}                                 from '@/lib/services/carrier.service';

const isUuid = (v: string) => fields.uuid().safeParse(v).success;

export const PATCH = withWorkspace(async (req, { team, params }) => {
    const { carrierId } = params;
    if ( !isUuid(carrierId) ) {
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

    const result = await updateExistingCarrier(carrierId, team.id, parsed.data);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.carrier);
});

export const DELETE = withWorkspace(async (_req, { team, params }) => {
    const { carrierId } = params;
    if ( !isUuid(carrierId) ) {
        return ApiResponse.notFound('Carrier not found.');
    }

    const result = await removeCarrier(carrierId, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(null);
});
