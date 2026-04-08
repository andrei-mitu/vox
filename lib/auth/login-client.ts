import type { LoginCredentials } from '@/lib/dto/auth.dto';

export type LoginClientResult =
  | { ok: true }
  | { ok: false; error: string };

export async function requestLogin(credentials: LoginCredentials): Promise<LoginClientResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      return { ok: false, error: data.error ?? 'Login failed' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Unexpected error' };
  }
}
