import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

/**
 * Service-role Supabase client — bypasses RLS entirely.
 * Use ONLY in Server Actions and Route Handlers. Never expose to the browser.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
