-- Seed: 001_admin
-- Creates (or idempotently updates) the dev admin user.
-- Uses pgcrypto crypt() for bcrypt password hashing.
--
-- Default credentials (dev only — change before any production use):
--   Email:    admin@admin.com
--   Password: Admin.123
--
-- To use a different password, replace the literal string 'Admin.123' below.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH upserted_user AS (
    INSERT INTO users (email, password_hash, email_confirmed_at)
        VALUES ('admin@admin.com', crypt('Admin.123', gen_salt('bf', 12)), NOW())
        ON CONFLICT (email) DO UPDATE
            SET password_hash = crypt('Admin.123', gen_salt('bf', 12)),
                email_confirmed_at = COALESCE(users.email_confirmed_at, NOW()),
                updated_at = NOW()
        RETURNING id)
INSERT
INTO profiles (id, full_name, system_role)
SELECT id, 'Admin', 'admin'
FROM upserted_user
ON CONFLICT (id) DO UPDATE SET full_name   = 'Admin',
                               system_role = 'admin',
                               updated_at  = NOW();
