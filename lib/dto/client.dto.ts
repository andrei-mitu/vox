import { z } from "zod";

// ---------------------------------------------------------------------------
// Create client
// ---------------------------------------------------------------------------

export const createClientSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    contactName: z.string().trim().max(200).nullable().optional(),
    contactEmail: z
        .email("Use a valid address with @ (e.g. you@domain.com)")
        .trim()
        .max(254)
        .nullable()
        .optional(),
    contactPhone: z.string().trim().max(50).nullable().optional(),
    billingAddress: z.string().trim().max(500).nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
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

export function parseCreateClientBody(
    input: unknown,
): { ok: true; data: CreateClientInput } | { ok: false; message: string } {
    const result = createClientSchema.safeParse(input);
    if ( !result.success ) {
        const message = result.error.issues[0]?.message ?? "Invalid input";
        return { ok: false, message };
    }
    return { ok: true, data: result.data };
}

export function parseUpdateClientBody(
    input: unknown,
): { ok: true; data: UpdateClientInput } | { ok: false; message: string } {
    const result = updateClientSchema.safeParse(input);
    if ( !result.success ) {
        const message = result.error.issues[0]?.message ?? "Invalid input";
        return { ok: false, message };
    }
    return { ok: true, data: result.data };
}
