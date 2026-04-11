import {z} from 'zod';
import type {CarrierMode, CarrierStatus} from '@/lib/db/schema';

export const CARRIER_MODE_LABELS: Record<CarrierMode, string> = {
    air: 'Air',
    ocean: 'Ocean',
    road: 'Road',
    rail: 'Rail',
};

// ---------------------------------------------------------------------------
// Create carrier
// ---------------------------------------------------------------------------

export const createCarrierSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    code: z.string().trim().min(1, 'Code is required').max(50),
    mode: z.enum(['air', 'ocean', 'road', 'rail'], {message: 'Select a transport mode'}),
    status: z.enum(['active', 'inactive']).default('active'),
    contactName: z.string().trim().max(200).nullable().optional(),
    contactEmail: z.string().trim().email('Enter a valid email').max(254).nullable().optional(),
    contactPhone: z.string().trim().max(50).nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
});

export type CreateCarrierInput = z.infer<typeof createCarrierSchema>;

// ---------------------------------------------------------------------------
// Update carrier (all fields optional)
// ---------------------------------------------------------------------------

export const updateCarrierSchema = createCarrierSchema.partial();
export type UpdateCarrierInput = z.infer<typeof updateCarrierSchema>;

// ---------------------------------------------------------------------------
// Carrier response DTO
// ---------------------------------------------------------------------------

export interface CarrierDto {
    id: string;
    teamId: string;
    name: string;
    code: string;
    mode: CarrierMode;
    status: CarrierStatus;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

// ---------------------------------------------------------------------------
// Parse helpers for Route Handlers
// ---------------------------------------------------------------------------

export function parseCreateCarrierBody(
    input: unknown,
): { ok: true; data: CreateCarrierInput } | { ok: false; message: string } {
    const result = createCarrierSchema.safeParse(input);
    if (!result.success) {
        const message = result.error.issues[0]?.message ?? 'Invalid input';
        return {ok: false, message};
    }
    return {ok: true, data: result.data};
}

export function parseUpdateCarrierBody(
    input: unknown,
): { ok: true; data: UpdateCarrierInput } | { ok: false; message: string } {
    const result = updateCarrierSchema.safeParse(input);
    if (!result.success) {
        const message = result.error.issues[0]?.message ?? 'Invalid input';
        return {ok: false, message};
    }
    return {ok: true, data: result.data};
}
