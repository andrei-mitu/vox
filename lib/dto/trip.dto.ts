import { z }              from 'zod';
import type {
    PhytoCostBy,
    TripStatus,
}                         from '@/lib/db/schema';
import { makeBodyParser } from '@/lib/validation/parse';

export type {
    TripStatus,
    PhytoCostBy
};

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
    CREATED: 'Created',
    CARRIER_ASSIGNED: 'Carrier Assigned',
    MONITORING: 'Monitoring',
    AWAITING_PAYMENT: 'Awaiting Payment',
    COMPLETED: 'Completed',
};

export const TRIP_STATUS_PIPELINE: TripStatus[] = [
    'CREATED',
    'CARRIER_ASSIGNED',
    'MONITORING',
    'AWAITING_PAYMENT',
    'COMPLETED',
];

// ---------------------------------------------------------------------------
// Base fields (used for both create and update)
// ---------------------------------------------------------------------------

const tripFieldsSchema = z.object({
    cargoName: z.string().trim().min(1, 'Cargo name is required').max(500),
    cargoType: z.string().trim().max(200).nullable().optional(),
    weightKg: z.number().positive().nullable().optional(),
    volumeM3: z.number().positive().nullable().optional(),
    thermal: z.boolean().default(false),
    tempMin: z.number().nullable().optional(),
    tempMax: z.number().nullable().optional(),
    thermodiagram: z.boolean().default(false),
    adr: z.boolean().default(false),
    adrClass: z.string().trim().max(100).nullable().optional(),
    phytosanitary: z.boolean().default(false),
    phytoCostBy: z.enum(['CARRIER', 'SENDER']).nullable().optional(),

    clientId: z.string().uuid().nullable().optional(),
    clientName: z.string().trim().max(200).nullable().optional(),
    contactPerson: z.string().trim().max(200).nullable().optional(),
    contactPhone: z.string().trim().max(50).nullable().optional(),
    contactEmail: z.string().trim().email('Invalid email').max(254).nullable().optional().or(
        z.literal('').transform(() => null),
    ),
    price: z.number().nonnegative().nullable().optional(),
    currency: z.string().trim().length(3).default('EUR'),
    paymentPeriod: z.number().int().positive().nullable().optional(),

    loadingAddress: z.string().trim().max(500).nullable().optional(),
    loadingCustoms: z.string().trim().max(500).nullable().optional(),
    unloadingAddress: z.string().trim().max(500).nullable().optional(),
    unloadingCustoms: z.string().trim().max(500).nullable().optional(),
    loadingDateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format').nullable().optional(),
    loadingDateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format').nullable().optional(),

    comments: z.string().trim().max(5000).nullable().optional(),
});

// ---------------------------------------------------------------------------
// Create trip — with cross-field refinements
// ---------------------------------------------------------------------------

export const createTripSchema = tripFieldsSchema.superRefine((data, ctx) => {
    if ( data.thermal && (data.tempMin == null || data.tempMax == null) ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'tempMin and tempMax required when thermal is true',
            path: ['tempMin'],
        });
    }
    if ( data.adr && !data.adrClass ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'adrClass required when ADR is true',
            path: ['adrClass'],
        });
    }
    if ( data.phytosanitary && !data.phytoCostBy ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'phytoCostBy required when phytosanitary is true',
            path: ['phytoCostBy'],
        });
    }
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

// ---------------------------------------------------------------------------
// Update trip — all fields optional, no cross-field refinements
// ---------------------------------------------------------------------------

export const updateTripSchema = tripFieldsSchema.partial();
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

// ---------------------------------------------------------------------------
// Advance status
// ---------------------------------------------------------------------------

export const advanceStatusSchema = z.object({
    status: z.enum(TRIP_STATUS_PIPELINE as [TripStatus, ...TripStatus[]]),
});
export type AdvanceStatusInput = z.infer<typeof advanceStatusSchema>;

// ---------------------------------------------------------------------------
// Trip response DTO
// ---------------------------------------------------------------------------

export interface TripDto {
    id: string;
    seqId: number;
    teamId: string;
    createdBy: string;
    status: TripStatus;

    cargoName: string;
    cargoType: string | null;
    weightKg: string | null;
    volumeM3: string | null;
    thermal: boolean;
    tempMin: string | null;
    tempMax: string | null;
    thermodiagram: boolean;
    adr: boolean;
    adrClass: string | null;
    phytosanitary: boolean;
    phytoCostBy: PhytoCostBy | null;

    clientId: string | null;
    clientName: string | null;
    contactPerson: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    price: string | null;
    currency: string;
    paymentPeriod: number | null;

    loadingAddress: string | null;
    loadingCustoms: string | null;
    unloadingAddress: string | null;
    unloadingCustoms: string | null;
    loadingDateFrom: string | null;
    loadingDateTo: string | null;

    comments: string | null;
    createdAt: string;
    updatedAt: string;
}

// ---------------------------------------------------------------------------
// Parse helpers for Route Handlers
// ---------------------------------------------------------------------------

export const parseCreateTripBody = makeBodyParser(createTripSchema);
export const parseUpdateTripBody = makeBodyParser(updateTripSchema);
export const parseAdvanceStatusBody = makeBodyParser(advanceStatusSchema);
