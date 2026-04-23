import { z } from 'zod';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const opt = <T extends z.ZodTypeAny>(s: T) => s.nullable().optional();

/**
 * Field that defaults to required. `fields.foo()` or `fields.foo(true)` → required schema.
 * `fields.foo(false)` → nullable+optional schema.
 */
type ReqField<TReq extends z.ZodTypeAny, TOpt extends z.ZodTypeAny> =
    ((req?: true) => TReq) & ((req: false) => TOpt);

function makeReqField<TReq extends z.ZodTypeAny, TOpt extends z.ZodTypeAny>(
    required: () => TReq,
    optional: () => TOpt,
): ReqField<TReq, TOpt> {
    return ((req = true) => req ? required() : optional()) as ReqField<TReq, TOpt>;
}

/**
 * Field that defaults to optional. `fields.foo()` or `fields.foo(false)` → nullable+optional.
 * `fields.foo(true)` → required schema.
 */
type OptField<TReq extends z.ZodTypeAny, TOpt extends z.ZodTypeAny> =
    (() => TOpt) & ((req: true) => TReq) & ((req: false) => TOpt);

function makeOptField<TReq extends z.ZodTypeAny, TOpt extends z.ZodTypeAny>(
    required: () => TReq,
    optional: () => TOpt,
): OptField<TReq, TOpt> {
    return ((req = false) => req ? required() : optional()) as OptField<TReq, TOpt>;
}

// ---------------------------------------------------------------------------
// Shared field definitions
// ---------------------------------------------------------------------------

export const fields = {
    /** Required by default. Pass `false` for nullable+optional. */
    name: makeReqField(
        () => z.string().trim().min(1, 'Name is required').max(200),
        () => opt(z.string().trim().max(200)),
    ),

    /** Optional (nullable) by default. Pass `true` for required. */
    contactName: makeOptField(
        () => z.string().trim().min(1).max(200),
        () => opt(z.string().trim().max(200)),
    ),

    /** Optional (nullable) by default. Pass `true` for required. */
    email: makeOptField(
        () => z.string().trim().email('Use a valid address with @ (e.g. you@domain.com)').max(254),
        () => opt(z.string().trim().email('Use a valid address with @ (e.g. you@domain.com)').max(254)),
    ),

    /** Optional (nullable) by default. Pass `true` for required. */
    phone: makeOptField(
        () => z.string().trim().max(50),
        () => opt(z.string().trim().max(50)),
    ),

    /** Optional (nullable) by default. Pass `true` for required. */
    notes: makeOptField(
        () => z.string().trim().max(2000),
        () => opt(z.string().trim().max(2000)),
    ),

    /** Optional (nullable) by default. Pass `true` for required. */
    address: makeOptField(
        () => z.string().trim().max(500),
        () => opt(z.string().trim().max(500)),
    ),

    uuid: () => z.string().uuid(),
};
