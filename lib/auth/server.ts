import { NextResponse } from 'next/server';
import type { User, AuthError } from '@supabase/supabase-js';
import { createSupabaseServerClient, type CookieStore } from '@/lib/supabase/server';

// ----------------------------------------------------------------------------
// Error Mapping
// ----------------------------------------------------------------------------

export const ERR_INVALID_CREDENTIALS = 'Incorrect email or password. Please try again.';
export const ERR_EMAIL_NOT_CONFIRMED = 'Confirm your email address before signing in.';
export const ERR_USER_BANNED = 'This account cannot sign in. Contact support if you need help.';
export const ERR_RATE_LIMIT = 'Too many sign-in attempts. Wait a moment and try again.';
export const ERR_UNKNOWN = 'An unexpected error occurred. Please try again.';

function getErrorCode(error: AuthError): string | undefined {
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code.length > 0 ? code : undefined;
}

export function mapAuthSignInError(error: AuthError): string {
  const code = getErrorCode(error);
  switch (code) {
    case 'user_not_found':
    case 'identity_not_found':
    case 'invalid_credentials':
      return ERR_INVALID_CREDENTIALS;
    case 'email_not_confirmed':
      return ERR_EMAIL_NOT_CONFIRMED;
    case 'user_banned':
      return ERR_USER_BANNED;
    case 'over_request_rate_limit':
      return ERR_RATE_LIMIT;
    default:
      return ERR_UNKNOWN;
  }
}

// ----------------------------------------------------------------------------
// Session & Sign-in
// ----------------------------------------------------------------------------

export async function getSessionUser(cookieStore: CookieStore): Promise<User | null> {
  const supabase = createSupabaseServerClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

export type SignInSuccess = { ok: true; user: User };
export type SignInFailure = { ok: false; status: 401; message: string };

export async function signInWithPassword(
  email: string,
  password: string,
  cookieStore: CookieStore
): Promise<SignInSuccess | SignInFailure> {
  const supabase = createSupabaseServerClient(cookieStore);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, status: 401, message: mapAuthSignInError(error) };
  }

  if (!data.user) {
    return { ok: false, status: 401, message: 'We could not complete sign-in. Try again.' };
  }

  return { ok: true, user: data.user };
}

export async function signOutAndRedirect(
  requestUrl: string,
  cookieStore: CookieStore
): Promise<NextResponse> {
  const supabase = createSupabaseServerClient(cookieStore);
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', requestUrl));
}
