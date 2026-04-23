import { z }              from 'zod';
import { fields }         from '@/lib/validation/fields';
import { makeBodyParser } from '@/lib/validation/parse';

// ---------------------------------------------------------------------------
// Create client
// ---------------------------------------------------------------------------

export const createClientSchema = z.object({
    name: fields.name(),
    contactName: fields.contactName(),
    contactEmail: fields.email(),
    contactPhone: fields.phone(),
    billingAddress: fields.address(),
    notes: fields.notes(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

// ---------------------------------------------------------------------------
// Update client (all fields optional)
// ---------------------------------------------------------------------------

export const updateClientSchema = createClientSchema.partial();
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// ---------------------------------------------------------------------------
// Client response DTO
// ---------------------------------------------------------------------------

export interface ClientDto {
    id: string;
    teamId: string;
    name: string;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    billingAddress: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

// ---------------------------------------------------------------------------
// Parse helpers for Route Handlers
// ---------------------------------------------------------------------------

export const parseCreateClientBody = makeBodyParser(createClientSchema);
export const parseUpdateClientBody = makeBodyParser(updateClientSchema);
