import type { ZodType } from 'zod';

export function makeBodyParser<T>(schema: ZodType<T>) {
    return (input: unknown): { ok: true; data: T } | { ok: false; message: string } => {
        const r = schema.safeParse(input);
        if ( !r.success ) {
            return { ok: false, message: r.error.issues[0]?.message ?? 'Invalid input' };
        }
        return { ok: true, data: r.data };
    };
}

export function makeFormParser<T>(schema: ZodType<T>) {
    return (input: unknown): { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string> } => {
        const r = schema.safeParse(input);
        if ( !r.success ) {
            const flat = r.error.flatten().fieldErrors as Record<string, string[] | undefined>;
            const errors: Record<string, string> = {};
            for ( const [k, msgs] of Object.entries(flat) ) {
                if ( msgs?.[0] ) {
                    errors[k] = msgs[0];
                }
            }
            return { ok: false, fieldErrors: errors };
        }
        return { ok: true, data: r.data };
    };
}
