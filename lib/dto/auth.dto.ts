import { z }      from 'zod';
import { fields } from '@/lib/validation/fields';

const trimmed = z.string().trim();

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const loginCredentialsSchema = z.object({
    email: fields.email(true),
    password: trimmed
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must include at least one capital letter")
        .regex(/\d/, "Password must include at least one digit"),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type LoginFieldErrors = Partial<Record<keyof LoginCredentials, string>>;

export function fieldErrorsFromLoginParse(
    error: z.ZodError<LoginCredentials>,
): LoginFieldErrors {
    const flat = error.flatten().fieldErrors;
    return {
        email: flat.email?.[0],
        password: flat.password?.[0],
    };
}

/** Client-side parse: returns field-level errors for form display. */
export function parseLoginCredentials(
    input: unknown,
):
    | { ok: true; data: LoginCredentials }
    | { ok: false; error: LoginFieldErrors } {
    const result = loginCredentialsSchema.safeParse(input);
    if ( !result.success ) {
        return { ok: false, error: fieldErrorsFromLoginParse(result.error) };
    }
    return { ok: true, data: result.data };
}

/** Route handler parse: returns a single message string for 400 responses. */
export function parseLoginBody(
    input: unknown,
): { ok: true; data: LoginCredentials } | { ok: false; message: string } {
    const result = loginCredentialsSchema.safeParse(input);
    if ( !result.success ) {
        const message = result.error.issues[0]?.message ?? "Invalid input";
        return { ok: false, message };
    }
    return { ok: true, data: result.data };
}

// ---------------------------------------------------------------------------
// Session response (what the API returns after login)
// ---------------------------------------------------------------------------

export interface SessionUserDto {
    id: string;
    email: string;
    role: "admin" | "user";
}

// ---------------------------------------------------------------------------
// Request access
// ---------------------------------------------------------------------------

export const requestAccessSchema = z.object({
    fullName: trimmed.min(1, 'Full name is required').max(200),
    email: fields.email(true),
    companyName: trimmed.min(1, 'Company name is required').max(200),
    message: trimmed.max(2000).optional(),
});

export type RequestAccessInput = z.infer<typeof requestAccessSchema>;
export type RequestAccessFieldErrors = Partial<
    Record<keyof RequestAccessInput, string>
>;

/** Route handler parse — single message string for 400 responses. */
export function parseRequestAccessBody(
    input: unknown,
): { ok: true; data: RequestAccessInput } | { ok: false; message: string } {
    const result = requestAccessSchema.safeParse(input);
    if ( !result.success ) {
        return {
            ok: false,
            message: result.error.issues[0]?.message ?? "Invalid input",
        };
    }
    return { ok: true, data: result.data };
}

/** Client-side parse — field-level errors for form display. */
export function parseRequestAccessForm(
    input: unknown,
):
    | { ok: true; data: RequestAccessInput }
    | { ok: false; error: RequestAccessFieldErrors } {
    const result = requestAccessSchema.safeParse(input);
    if ( !result.success ) {
        const flat = result.error.flatten().fieldErrors;
        return {
            ok: false,
            error: {
                fullName: flat.fullName?.[0],
                email: flat.email?.[0],
                companyName: flat.companyName?.[0],
                message: flat.message?.[0],
            },
        };
    }
    return { ok: true, data: result.data };
}

// ---------------------------------------------------------------------------
// Admin response types
// ---------------------------------------------------------------------------

export interface ApproveAccessRequestResult {
    userId: string;
    email: string;
    tempPassword: string; // shown once to admin; never stored in plain text
}
