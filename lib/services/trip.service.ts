import type { Trip }            from "@/lib/db/schema";
import type {
    AdvanceStatusInput,
    CreateTripInput,
    TripDto,
    TripStatus,
    UpdateTripInput,
}                               from "@/lib/dto/trip.dto";
import { TRIP_STATUS_PIPELINE } from "@/lib/dto/trip.dto";
import type { TripFilters }     from "@/lib/repositories/trip.repository";
import {
    createTrip,
    deleteTrip,
    findTripBySeqId,
    findTripsByTeamId,
    updateTrip,
    updateTripStatus,
}                               from "@/lib/repositories/trip.repository";

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function toTripDto(trip: Trip): TripDto {
    return {
        id: trip.id,
        seqId: trip.seqId,
        teamId: trip.teamId,
        createdBy: trip.createdBy,
        status: trip.status,

        cargoName: trip.cargoName,
        cargoType: trip.cargoType,
        weightKg: trip.weightKg,
        volumeM3: trip.volumeM3,
        thermal: trip.thermal,
        tempMin: trip.tempMin,
        tempMax: trip.tempMax,
        thermodiagram: trip.thermodiagram,
        adr: trip.adr,
        adrClass: trip.adrClass,
        phytosanitary: trip.phytosanitary,
        phytoCostBy: trip.phytoCostBy,

        clientId: trip.clientId,
        clientName: trip.clientName,
        contactPerson: trip.contactPerson,
        contactPhone: trip.contactPhone,
        contactEmail: trip.contactEmail,
        price: trip.price,
        currency: trip.currency,
        paymentPeriod: trip.paymentPeriod,

        loadingAddress: trip.loadingAddress,
        loadingCustoms: trip.loadingCustoms,
        unloadingAddress: trip.unloadingAddress,
        unloadingCustoms: trip.unloadingCustoms,
        loadingDateFrom: trip.loadingDateFrom,
        loadingDateTo: trip.loadingDateTo,

        comments: trip.comments,
        createdAt: trip.createdAt.toISOString(),
        updatedAt: trip.updatedAt.toISOString(),
    };
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type TripSuccess = { ok: true; trip: TripDto };
export type TripFailure = { ok: false; status: number; message: string };

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getTrip(
    teamId: string,
    seqId: number,
): Promise<TripDto | null> {
    const row = await findTripBySeqId(seqId, teamId);
    return row ? toTripDto(row) : null;
}

export async function getTripsForTeam(
    teamId: string,
    filters: TripFilters = {},
): Promise<TripDto[]> {
    const rows = await findTripsByTeamId(teamId, filters);
    return rows.map(toTripDto);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createNewTrip(
    input: CreateTripInput,
    teamId: string,
    userId: string,
): Promise<TripSuccess | TripFailure> {
    const trip = await createTrip({
        teamId,
        createdBy: userId,
        status: "CREATED",
        cargoName: input.cargoName,
        cargoType: input.cargoType ?? null,
        weightKg: input.weightKg != null ? String(input.weightKg) : null,
        volumeM3: input.volumeM3 != null ? String(input.volumeM3) : null,
        thermal: input.thermal ?? false,
        tempMin: input.tempMin != null ? String(input.tempMin) : null,
        tempMax: input.tempMax != null ? String(input.tempMax) : null,
        thermodiagram: input.thermodiagram ?? false,
        adr: input.adr ?? false,
        adrClass: input.adrClass ?? null,
        phytosanitary: input.phytosanitary ?? false,
        phytoCostBy: input.phytoCostBy ?? null,
        clientId: input.clientId ?? null,
        clientName: input.clientName ?? null,
        contactPerson: input.contactPerson ?? null,
        contactPhone: input.contactPhone ?? null,
        contactEmail: input.contactEmail ?? null,
        price: input.price != null ? String(input.price) : null,
        currency: input.currency ?? "EUR",
        paymentPeriod: input.paymentPeriod ?? null,
        loadingAddress: input.loadingAddress ?? null,
        loadingCustoms: input.loadingCustoms ?? null,
        unloadingAddress: input.unloadingAddress ?? null,
        unloadingCustoms: input.unloadingCustoms ?? null,
        loadingDateFrom: input.loadingDateFrom ?? null,
        loadingDateTo: input.loadingDateTo ?? null,
        comments: input.comments ?? null,
    });
    return { ok: true, trip: toTripDto(trip) };
}

export async function updateExistingTrip(
    seqId: number,
    teamId: string,
    input: UpdateTripInput,
): Promise<TripSuccess | TripFailure> {
    const existing = await findTripBySeqId(seqId, teamId);
    if ( !existing ) {
        return { ok: false, status: 404, message: "Trip not found." };
    }
    if ( existing.status !== "CREATED" ) {
        return { ok: false, status: 409, message: "Only trips in CREATED status can be edited." };
    }

    const patch: Parameters<typeof updateTrip>[2] = {};
    if ( input.cargoName !== undefined ) {
        patch.cargoName = input.cargoName;
    }
    if ( input.cargoType !== undefined ) {
        patch.cargoType = input.cargoType ?? null;
    }
    if ( input.weightKg !== undefined ) {
        patch.weightKg = input.weightKg != null ? String(input.weightKg) : null;
    }
    if ( input.volumeM3 !== undefined ) {
        patch.volumeM3 = input.volumeM3 != null ? String(input.volumeM3) : null;
    }
    if ( input.thermal !== undefined ) {
        patch.thermal = input.thermal;
    }
    if ( input.tempMin !== undefined ) {
        patch.tempMin = input.tempMin != null ? String(input.tempMin) : null;
    }
    if ( input.tempMax !== undefined ) {
        patch.tempMax = input.tempMax != null ? String(input.tempMax) : null;
    }
    if ( input.thermodiagram !== undefined ) {
        patch.thermodiagram = input.thermodiagram;
    }
    if ( input.adr !== undefined ) {
        patch.adr = input.adr;
    }
    if ( input.adrClass !== undefined ) {
        patch.adrClass = input.adrClass ?? null;
    }
    if ( input.phytosanitary !== undefined ) {
        patch.phytosanitary = input.phytosanitary;
    }
    if ( input.phytoCostBy !== undefined ) {
        patch.phytoCostBy = input.phytoCostBy ?? null;
    }
    if ( input.clientId !== undefined ) {
        patch.clientId = input.clientId ?? null;
    }
    if ( input.clientName !== undefined ) {
        patch.clientName = input.clientName ?? null;
    }
    if ( input.contactPerson !== undefined ) {
        patch.contactPerson = input.contactPerson ?? null;
    }
    if ( input.contactPhone !== undefined ) {
        patch.contactPhone = input.contactPhone ?? null;
    }
    if ( input.contactEmail !== undefined ) {
        patch.contactEmail = input.contactEmail ?? null;
    }
    if ( input.price !== undefined ) {
        patch.price = input.price != null ? String(input.price) : null;
    }
    if ( input.currency !== undefined ) {
        patch.currency = input.currency;
    }
    if ( input.paymentPeriod !== undefined ) {
        patch.paymentPeriod = input.paymentPeriod ?? null;
    }
    if ( input.loadingAddress !== undefined ) {
        patch.loadingAddress = input.loadingAddress ?? null;
    }
    if ( input.loadingCustoms !== undefined ) {
        patch.loadingCustoms = input.loadingCustoms ?? null;
    }
    if ( input.unloadingAddress !== undefined ) {
        patch.unloadingAddress = input.unloadingAddress ?? null;
    }
    if ( input.unloadingCustoms !== undefined ) {
        patch.unloadingCustoms = input.unloadingCustoms ?? null;
    }
    if ( input.loadingDateFrom !== undefined ) {
        patch.loadingDateFrom = input.loadingDateFrom ?? null;
    }
    if ( input.loadingDateTo !== undefined ) {
        patch.loadingDateTo = input.loadingDateTo ?? null;
    }
    if ( input.comments !== undefined ) {
        patch.comments = input.comments ?? null;
    }

    const trip = await updateTrip(seqId, teamId, patch);
    if ( !trip ) {
        return { ok: false, status: 404, message: "Trip not found." };
    }
    return { ok: true, trip: toTripDto(trip) };
}

export async function removeTrip(
    seqId: number,
    teamId: string,
): Promise<{ ok: true } | TripFailure> {
    const existing = await findTripBySeqId(seqId, teamId);
    if ( !existing ) {
        return { ok: false, status: 404, message: "Trip not found." };
    }
    if ( existing.status !== "CREATED" ) {
        return { ok: false, status: 409, message: "Only trips in CREATED status can be deleted." };
    }
    await deleteTrip(seqId, teamId);
    return { ok: true };
}

export async function advanceTripStatus(
    seqId: number,
    teamId: string,
    input: AdvanceStatusInput,
): Promise<TripSuccess | TripFailure> {
    const existing = await findTripBySeqId(seqId, teamId);
    if ( !existing ) {
        return { ok: false, status: 404, message: "Trip not found." };
    }

    const currentIdx = TRIP_STATUS_PIPELINE.indexOf(existing.status as TripStatus);
    const newIdx = TRIP_STATUS_PIPELINE.indexOf(input.status);

    if ( newIdx !== currentIdx + 1 ) {
        return {
            ok: false,
            status: 422,
            message: `Cannot transition from ${ existing.status } to ${ input.status }.`,
        };
    }

    const trip = await updateTripStatus(seqId, teamId, input.status);
    if ( !trip ) {
        return { ok: false, status: 404, message: "Trip not found." };
    }
    return { ok: true, trip: toTripDto(trip) };
}
