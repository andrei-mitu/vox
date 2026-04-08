import {z} from 'zod';

const trimmed = z.string().trim();

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

// Client-side: non-empty only (no password policy hints in client errors).
export const loginCredentialsSchema = z.object({
    email: z.email('Use a valid address with @ (e.g. you@domain.com)').trim()
        .min(1, 'Enter your email (include @)'),
    password: trimmed
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must include at least one capital letter')
        .regex(/\d/, 'Password must include at least one digit'),
});

// Server-side: full rules enforced at the API boundary.
export const loginCredentialsServerSchema = z.object({
    email: z.string().email('Invalid email address').trim(),
    password: z.string().min(1, 'Password is required'),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type LoginFieldErrors = Partial<Record<keyof LoginCredentials, string>>;

export function fieldErrorsFromLoginParse(error: z.ZodError<LoginCredentials>): LoginFieldErrors {
    const flat = error.flatten().fieldErrors;
    return {
        email: flat.email?.[0],
        password: flat.password?.[0],
    };
}

/** Client-side parse: returns field-level errors for form display. */
export function parseLoginCredentials(
    input: unknown
): { ok: true; data: LoginCredentials } | { ok: false; error: LoginFieldErrors } {
    const result = loginCredentialsSchema.safeParse(input);
    if (!result.success) {
        return {ok: false, error: fieldErrorsFromLoginParse(result.error)};
    }
    return {ok: true, data: result.data};
}

/** Route handler parse: returns a single message string for 400 responses. */
export function parseLoginBody(
    input: unknown
): { ok: true; data: LoginCredentials } | { ok: false; message: string } {
    const result = loginCredentialsServerSchema.safeParse(input);
    if (!result.success) {
        const message = result.error.issues[0]?.message ?? 'Invalid input';
        return {ok: false, message};
    }
    return {ok: true, data: result.data};
}

// ---------------------------------------------------------------------------
// Session response (what the API returns after login)
// ---------------------------------------------------------------------------

export interface SessionUserDto {
    id: string;
    email: string;
    role: 'admin' | 'user';
}
