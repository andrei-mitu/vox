import { z } from "zod";

// ---------------------------------------------------------------------------
// Create route
// ---------------------------------------------------------------------------

export const createRouteSchema = z.object({
    originCity: z.string().trim().min(1, "Origin city is required").max(200),
    originCountry: z.string().trim().min(1, "Origin country is required").max(100),
    destCity: z.string().trim().min(1, "Destination city is required").max(200),
    destCountry: z.string().trim().min(1, "Destination country is required").max(100),
    distanceKm: z.number().int().positive("Distance must be a positive number").nullable().optional(),
    transitDays: z.number().int().positive("Transit days must be a positive number").nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;

// ---------------------------------------------------------------------------
// Update route (all fields optional)
// ---------------------------------------------------------------------------

export const updateRouteSchema = createRouteSchema.partial();
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;

// ---------------------------------------------------------------------------
// Route response DTO
// ---------------------------------------------------------------------------

export interface RouteDto {
    id: string;
    teamId: string;
    originCity: string;
    originCountry: string;
    destCity: string;
    destCountry: string;
    distanceKm: number | null;
    transitDays: number | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

// ---------------------------------------------------------------------------
// Parse helpers for Route Handlers
// ---------------------------------------------------------------------------

export function parseCreateRouteBody(
    input: unknown,
): { ok: true; data: CreateRouteInput } | { ok: false; message: string } {
    const result = createRouteSchema.safeParse(input);
    if ( !result.success ) {
        const message = result.error.issues[0]?.message ?? "Invalid input";
        return { ok: false, message };
    }
    return { ok: true, data: result.data };
}

export function parseUpdateRouteBody(
    input: unknown,
): { ok: true; data: UpdateRouteInput } | { ok: false; message: string } {
    const result = updateRouteSchema.safeParse(input);
    if ( !result.success ) {
        const message = result.error.issues[0]?.message ?? "Invalid input";
        return { ok: false, message };
    }
    return { ok: true, data: result.data };
}
