-- Seed: 002_demo_data
-- Creates demo teams, regular users, memberships, and access requests.
-- All passwords are:  Password.1
-- Idempotent: safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

WITH u AS (
    INSERT INTO users (email, password_hash, email_confirmed_at)
        VALUES
            ('alice@demo.com', crypt('Password.1', gen_salt('bf', 12)), NOW()),
            ('bob@demo.com',   crypt('Password.1', gen_salt('bf', 12)), NOW()),
            ('carol@demo.com', crypt('Password.1', gen_salt('bf', 12)), NOW()),
            ('dave@demo.com',  crypt('Password.1', gen_salt('bf', 12)), NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email)
INSERT INTO profiles (id, full_name, system_role)
SELECT id,
       CASE email
           WHEN 'alice@demo.com' THEN 'Alice Müller'
           WHEN 'bob@demo.com'   THEN 'Bob Tanaka'
           WHEN 'carol@demo.com' THEN 'Carol Ndiaye'
           WHEN 'dave@demo.com'  THEN 'Dave Osei'
           END,
       'user'
FROM u
ON CONFLICT (id) DO UPDATE
    SET full_name   = EXCLUDED.full_name,
        system_role = 'user',
        updated_at  = NOW();

-- ---------------------------------------------------------------------------
-- Teams
-- ---------------------------------------------------------------------------

INSERT INTO teams (id, name, slug, visibility)
VALUES
    ('00000000-0000-0000-0001-000000000001', 'Apex Logistics',   'apex-logistics',   'shared'),
    ('00000000-0000-0000-0001-000000000002', 'Blue Freight',     'blue-freight',     'shared'),
    ('00000000-0000-0000-0001-000000000003', 'Coastal Carriers', 'coastal-carriers', 'private')
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        slug       = EXCLUDED.slug,
        visibility = EXCLUDED.visibility,
        updated_at = NOW();

-- ---------------------------------------------------------------------------
-- Team memberships
-- ---------------------------------------------------------------------------
-- alice  → apex-logistics (owner), blue-freight (logistician)
-- bob    → apex-logistics (logistician)
-- carol  → blue-freight (owner), coastal-carriers (owner)
-- dave   → coastal-carriers (logistician)

INSERT INTO team_members (team_id, user_id, role)
SELECT t.id, u.id, m.role
FROM (VALUES
         ('apex-logistics',   'alice@demo.com', 'owner'       :: team_role),
         ('blue-freight',     'alice@demo.com', 'logistician' :: team_role),
         ('apex-logistics',   'bob@demo.com',   'logistician' :: team_role),
         ('blue-freight',     'carol@demo.com', 'owner'       :: team_role),
         ('coastal-carriers', 'carol@demo.com', 'owner'       :: team_role),
         ('coastal-carriers', 'dave@demo.com',  'logistician' :: team_role)
     ) AS m(slug, email, role)
         JOIN teams t ON t.slug = m.slug
         JOIN users u ON u.email = m.email
ON CONFLICT (team_id, user_id) DO UPDATE
    SET role = EXCLUDED.role;

-- ---------------------------------------------------------------------------
-- Access requests
-- ---------------------------------------------------------------------------

INSERT INTO access_requests (email, full_name, company_name, message, status)
VALUES
    ('eve@globalship.com',  'Eve Larsson',   'GlobalShip Ltd',   'We need a multi-carrier solution for EU routes.',   'pending'),
    ('frank@fastfreight.io','Frank Okafor',  'FastFreight',      'Looking to manage our FTL carriers in one place.',  'pending'),
    ('grace@transco.net',   'Grace Kim',     'TransCo',          NULL,                                                'approved'),
    ('henry@movemore.co',   'Henry Patel',   'MoveMore',         'Interested in the shipment tracking features.',     'rejected')
ON CONFLICT DO NOTHING;
