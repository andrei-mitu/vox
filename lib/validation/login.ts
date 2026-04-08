import { z } from 'zod';

const trimmed = z.string().trim();

// Client-side schema: non-empty only.
// Full structural validation stays server-side to avoid leaking password policy
// via UX differences (enumeration oracle).
export const loginCredentialsSchema = z.object({
  email: trimmed.min(1, 'Enter your email'),
  password: trimmed.min(1, 'Enter your password'),
});

// Server-side schema: full rules enforced at the API boundary.
export const loginCredentialsServerSchema = z.object({
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export type LoginFieldErrors = Partial<Record<keyof LoginCredentials, string>>;

export function fieldErrorsFromLoginParse(
  error: z.ZodError<LoginCredentials>
): LoginFieldErrors {
  const flat = error.flatten().fieldErrors;
  return {
    email: flat.email?.[0],
    password: flat.password?.[0],
  };
}

export function parseLoginCredentials(
  input: unknown
): { ok: true; data: LoginCredentials } | { ok: false; error: LoginFieldErrors } {
  const result = loginCredentialsSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: fieldErrorsFromLoginParse(result.error) };
  }
  return { ok: true, data: result.data };
}

/** Route handlers: one message for 400 responses. */
export function parseLoginBody(
  input: unknown
): { ok: true; data: LoginCredentials } | { ok: false; message: string } {
  const result = loginCredentialsServerSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid input';
    return { ok: false, message };
  }
  return { ok: true, data: result.data };
}
