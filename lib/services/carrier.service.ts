import {
    createCarrier,
    deleteCarrier,
    findCarriersByTeamId,
    updateCarrier,
} from '@/lib/repositories/carrier.repository';
import type {Carrier} from '@/lib/db/schema';
import type {CarrierDto, CreateCarrierInput, UpdateCarrierInput} from '@/lib/dto/carrier.dto';
import {isUniqueViolation} from '@/lib/db/errors';

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function toCarrierDto(carrier: Carrier): CarrierDto {
    return {
        id: carrier.id,
        teamId: carrier.teamId,
        name: carrier.name,
        code: carrier.code,
        mode: carrier.mode,
        status: carrier.status,
        contactName: carrier.contactName ?? null,
        contactEmail: carrier.contactEmail ?? null,
        contactPhone: carrier.contactPhone ?? null,
        notes: carrier.notes ?? null,
        createdAt: carrier.createdAt.toISOString(),
        updatedAt: carrier.updatedAt.toISOString(),
    };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getCarriersForTeam(teamId: string): Promise<CarrierDto[]> {
    const rows = await findCarriersByTeamId(teamId);
    return rows.map(toCarrierDto);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export type CarrierSuccess = {ok: true; carrier: CarrierDto};
export type CarrierFailure = {ok: false; status: number; message: string};

export async function createNewCarrier(
    input: CreateCarrierInput,
    teamId: string,
): Promise<CarrierSuccess | CarrierFailure> {
    try {
        const carrier = await createCarrier({
            teamId,
            name: input.name,
            code: input.code.toUpperCase(),
            mode: input.mode,
            status: input.status ?? 'active',
            contactName: input.contactName ?? null,
            contactEmail: input.contactEmail ?? null,
            contactPhone: input.contactPhone ?? null,
            notes: input.notes ?? null,
        });
        return {ok: true, carrier: toCarrierDto(carrier)};
    } catch (err) {
        if (isUniqueViolation(err)) {
            return {ok: false, status: 409, message: 'A carrier with that code already exists in this workspace.'};
        }
        throw err;
    }
}

export async function updateExistingCarrier(
    id: string,
    teamId: string,
    input: UpdateCarrierInput,
): Promise<CarrierSuccess | CarrierFailure> {
    const patch: Parameters<typeof updateCarrier>[2] = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.code !== undefined) patch.code = input.code.toUpperCase();
    if (input.mode !== undefined) patch.mode = input.mode;
    if (input.status !== undefined) patch.status = input.status;
    if (input.contactName !== undefined) patch.contactName = input.contactName ?? null;
    if (input.contactEmail !== undefined) patch.contactEmail = input.contactEmail ?? null;
    if (input.contactPhone !== undefined) patch.contactPhone = input.contactPhone ?? null;
    if (input.notes !== undefined) patch.notes = input.notes ?? null;

    try {
        const carrier = await updateCarrier(id, teamId, patch);
        if (!carrier) {
            return {ok: false, status: 404, message: 'Carrier not found.'};
        }
        return {ok: true, carrier: toCarrierDto(carrier)};
    } catch (err) {
        if (isUniqueViolation(err)) {
            return {ok: false, status: 409, message: 'A carrier with that code already exists in this workspace.'};
        }
        throw err;
    }
}

export async function removeCarrier(
    id: string,
    teamId: string,
): Promise<{ok: true} | CarrierFailure> {
    const deleted = await deleteCarrier(id, teamId);
    if (!deleted) {
        return {ok: false, status: 404, message: 'Carrier not found.'};
    }
    return {ok: true};
}
