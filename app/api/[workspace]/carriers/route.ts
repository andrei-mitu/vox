import { readJsonBody }           from '@/lib/api/request';
import { ApiResponse }            from '@/lib/api/response';
import { withWorkspace }          from '@/lib/api/with-workspace';
import { parseCreateCarrierBody } from '@/lib/dto/carrier.dto';
import {
    createNewCarrier,
    getCarriersForTeam,
}                                 from '@/lib/services/carrier.service';

export const GET = withWorkspace(async (_req, { team }) => {
    const carriers = await getCarriersForTeam(team.id);
    return ApiResponse.ok(carriers);
});

export const POST = withWorkspace(async (req, { team }) => {
    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseCreateCarrierBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await createNewCarrier(parsed.data, team.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.carrier, 201);
});
