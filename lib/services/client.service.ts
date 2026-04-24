import type { Client } from "@/lib/db/schema";
import type {
    ClientDto,
    CreateClientInput,
    UpdateClientInput,
}                      from "@/lib/dto/client.dto";
import {
    createClient,
    deleteClient,
    findClientBySeqId,
    findClientsByTeamId,
    searchClients,
    updateClient,
}                      from "@/lib/repositories/client.repository";

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function toClientDto(client: Client): ClientDto {
    return {
        id: client.id,
        seqId: client.seqId,
        teamId: client.teamId,
        name: client.name,
        contactName: client.contactName,
        contactEmail: client.contactEmail,
        contactPhone: client.contactPhone,
        billingAddress: client.billingAddress,
        notes: client.notes,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
    };
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type ClientSuccess = { ok: true; client: ClientDto };
export type ClientFailure = { ok: false; status: number; message: string };

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getClientsForTeam(
    teamId: string,
): Promise<ClientDto[]> {
    const rows = await findClientsByTeamId(teamId);
    return rows.map(toClientDto);
}

export async function getClient(
    teamId: string,
    seqId: number,
): Promise<ClientDto | null> {
    const row = await findClientBySeqId(seqId, teamId);
    return row ? toClientDto(row) : null;
}

export async function searchClientsForTeam(
    teamId: string,
    query: string,
): Promise<ClientDto[]> {
    const rows = await searchClients(teamId, query);
    return rows.map(toClientDto);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createNewClient(
    input: CreateClientInput,
    teamId: string,
): Promise<ClientSuccess | ClientFailure> {
    const client = await createClient({
        teamId,
        name: input.name,
        contactName: input.contactName ?? null,
        contactEmail: input.contactEmail ?? null,
        contactPhone: input.contactPhone ?? null,
        billingAddress: input.billingAddress ?? null,
        notes: input.notes ?? null,
    });
    return { ok: true, client: toClientDto(client) };
}

export async function updateExistingClient(
    seqId: number,
    teamId: string,
    input: UpdateClientInput,
): Promise<ClientSuccess | ClientFailure> {
    const existing = await findClientBySeqId(seqId, teamId);
    if ( !existing ) {
        return { ok: false, status: 404, message: "Client not found." };
    }
    const patch: Parameters<typeof updateClient>[2] = {};
    if ( input.name !== undefined ) patch.name = input.name;
    if ( input.contactName !== undefined ) patch.contactName = input.contactName ?? null;
    if ( input.contactEmail !== undefined ) patch.contactEmail = input.contactEmail ?? null;
    if ( input.contactPhone !== undefined ) patch.contactPhone = input.contactPhone ?? null;
    if ( input.billingAddress !== undefined ) patch.billingAddress = input.billingAddress ?? null;
    if ( input.notes !== undefined ) patch.notes = input.notes ?? null;

    const client = await updateClient(existing.id, teamId, patch);
    if ( !client ) {
        return { ok: false, status: 404, message: "Client not found." };
    }
    return { ok: true, client: toClientDto(client) };
}

export async function removeClient(
    seqId: number,
    teamId: string,
): Promise<{ ok: true } | ClientFailure> {
    const existing = await findClientBySeqId(seqId, teamId);
    if ( !existing ) {
        return { ok: false, status: 404, message: "Client not found." };
    }
    await deleteClient(existing.id, teamId);
    return { ok: true };
}
