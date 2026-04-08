import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/repositories/user.repository';
import { sessionCookie, signSession, verifySession } from '@/lib/auth/session';
import type { SessionUserDto } from '@/lib/dto/auth.dto';

// ---------------------------------------------------------------------------
// Error messages
// ---------------------------------------------------------------------------

export const ERR_INVALID_CREDENTIALS = 'Incorrect email or password. Please try again.';

// Dummy hash used when no user is found — ensures constant-time response
// regardless of whether the email exists, preventing timing-based enumeration.
const DUMMY_HASH = '$2b$12$invalidsaltinvalidsaltinvalidXXXXXXXXXXXXXXXXXXXXXXX';

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export type SignInSuccess = { ok: true;  user: SessionUserDto };
export type SignInFailure = { ok: false; status: 401; message: string };

export async function signIn(email: string, password: string): Promise<SignInSuccess | SignInFailure> {
  const user = await findUserByEmail(email);

  // Always run bcrypt to prevent timing-based email enumeration.
  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !passwordMatch) {
    return { ok: false, status: 401, message: ERR_INVALID_CREDENTIALS };
  }

  if (!user.emailConfirmedAt) {
    return { ok: false, status: 401, message: ERR_INVALID_CREDENTIALS };
  }

  if (user.bannedUntil && user.bannedUntil > new Date()) {
    return { ok: false, status: 401, message: ERR_INVALID_CREDENTIALS };
  }

  const cookieStore = await cookies();
  const token = await signSession({ sub: user.id, email: user.email, role: user.systemRole });
  const secure = process.env.NODE_ENV === 'production';
  cookieStore.set(sessionCookie.name, token, sessionCookie.options(secure));

  return { ok: true, user: { id: user.id, email: user.email, role: user.systemRole } };
}

// ---------------------------------------------------------------------------
// Get session user
// ---------------------------------------------------------------------------

export async function getSessionUser(): Promise<SessionUserDto | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie.name)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  return { id: payload.sub, email: payload.email, role: payload.role };
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOutAndRedirect(requestUrl: string): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie.name);
  return NextResponse.redirect(new URL('/login', requestUrl));
}
