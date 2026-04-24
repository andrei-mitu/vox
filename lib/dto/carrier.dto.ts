import { z }              from 'zod';
import type {
    CarrierMode,
    CarrierStatus
}                         from '@/lib/db/schema';
import { fields }         from '@/lib/validation/fields';
import { makeBodyParser } from '@/lib/validation/parse';

export type { CarrierMode, CarrierStatus };

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
    name: fields.name(),
    code: z.string().trim().min(1, 'Code is required').max(50),
    mode: z.enum(['air', 'ocean', 'road', 'rail'], { message: 'Select a transport mode' }),
    status: z.enum(['active', 'inactive']).default('active'),
    contactName: fields.contactName(),
    contactEmail: fields.email(),
    contactPhone: fields.phone(),
    notes: fields.notes(),
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
    seqId: number;
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

export const parseCreateCarrierBody = makeBodyParser(createCarrierSchema);
export const parseUpdateCarrierBody = makeBodyParser(updateCarrierSchema);
