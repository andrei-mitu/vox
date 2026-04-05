/**
 * Creates or updates a dev admin user in Supabase Auth (email + password, confirmed).
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
    if (error) {
      return { user: null as null, error };
    }
    const users = data.users;
    const found = users.find((u) => u.email?.toLowerCase() === normalized) ?? null;
    if (found) {
      return { user: found, error: null };
    }
    if (users.length < perPage) {
      return { user: null, error: null };
    }
    page += 1;
  }
}

async function main() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRole = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const email = requireEnv('SEED_ADMIN_EMAIL');
  const password = requireEnv('SEED_ADMIN_PASSWORD');

  const admin = createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { user: existing, error: listError } = await findUserByEmail(admin, email);
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

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
    console.log(`Updated existing user: ${email} (${existing.id})`);
    return;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  });

  if (error) {
    console.error('Failed to create admin user:', error.message);
    process.exit(1);
  }

  console.log(`Created admin user: ${email} (${data.user?.id})`);
}

main();
