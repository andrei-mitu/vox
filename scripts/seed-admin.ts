/**
 * Creates or updates a dev admin user in Supabase Auth and ensures their
 * profile row has system_role = 'admin'.
 * Requires SUPABASE_SERVICE_ROLE_KEY — never expose this in the browser or commit it.
 *
 * Usage: bun run seed:admin
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function findUserByEmail(admin: SupabaseClient, email: string) {
  const normalized = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return { user: null as null, error };
    const found = data.users.find((u) => u.email?.toLowerCase() === normalized) ?? null;
    if (found) return { user: found, error: null };
    if (data.users.length < perPage) return { user: null, error: null };
    page += 1;
  }
}

async function main() {
  const url          = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRole  = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const email        = requireEnv('SEED_ADMIN_EMAIL');
  const password     = requireEnv('SEED_ADMIN_PASSWORD');

  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { user: existing, error: listError } = await findUserByEmail(admin, email);
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  let userId: string;

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { ...existing.user_metadata, role: 'admin' },
    });
    if (error) {
      console.error('Failed to update admin user:', error.message);
      process.exit(1);
    }
    userId = existing.id;
    console.log(`Updated existing user: ${email} (${userId})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    if (error || !data.user) {
      console.error('Failed to create admin user:', error?.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`Created admin user: ${email} (${userId})`);
  }

  // Upsert profile with system_role = 'admin'.
  // The trigger handles new users but not updates to existing user_metadata,
  // so we upsert directly here using the service role (bypasses RLS + trigger guard).
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: userId, system_role: 'admin' }, { onConflict: 'id' });

  if (profileError) {
    console.error('Failed to upsert admin profile:', profileError.message);
    process.exit(1);
  }

  console.log(`Admin profile ensured for: ${email}`);
}

main();
