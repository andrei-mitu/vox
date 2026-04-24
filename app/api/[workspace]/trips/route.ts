import { readJsonBody }        from '@/lib/api/request';
import { ApiResponse }         from '@/lib/api/response';
import { withWorkspace }       from '@/lib/api/with-workspace';
import type { TripStatus }     from '@/lib/dto/trip.dto';
import { parseCreateTripBody } from '@/lib/dto/trip.dto';
import {
    createNewTrip,
    getTripsForTeam,
}                              from '@/lib/services/trip.service';

const VALID_STATUSES = ['CREATED', 'CARRIER_ASSIGNED', 'MONITORING', 'AWAITING_PAYMENT', 'COMPLETED'] as const;

export const GET = withWorkspace(async (req, { team }) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') as TripStatus | null;
    const search = url.searchParams.get('search') ?? undefined;

    const validStatus = status && (VALID_STATUSES as readonly string[]).includes(status)
        ? status
        : undefined;

    const trips = await getTripsForTeam(team.id, { status: validStatus, search });
    return ApiResponse.ok(trips);
});

export const POST = withWorkspace(async (req, { team, user }) => {
    const body = await readJsonBody(req);
    if ( body === null ) {
        return ApiResponse.badRequest('Invalid JSON body');
    }

    const parsed = parseCreateTripBody(body);
    if ( !parsed.ok ) {
        return ApiResponse.badRequest(parsed.message);
    }

    const result = await createNewTrip(parsed.data, team.id, user.id);
    if ( !result.ok ) {
        return ApiResponse.error(result.message, result.status);
    }

    return ApiResponse.ok(result.trip, 201);
});
