-- Seed: 003_carriers
-- Mock carriers for the three demo teams.
-- Idempotent: safe to run multiple times.

INSERT INTO carriers (id, team_id, name, code, mode, status, contact_name, contact_email, contact_phone, notes)
SELECT c.id::uuid, t.id, c.name, c.code, c.mode::carrier_mode, c.status::carrier_status,
       c.contact_name, c.contact_email, c.contact_phone, c.notes
FROM (VALUES
    -- apex-logistics
    ('00000000-0000-0000-0002-000000000001', 'apex-logistics',   'TransEurope GmbH',      'TREU',  'road',  'active',   'Klaus Bauer',     'k.bauer@transeurope.de',    '+49 89 21540000',  'Primary DE-RO lane partner.'),
    ('00000000-0000-0000-0002-000000000002', 'apex-logistics',   'Silk Road Logistics',   'SRL',   'rail',  'active',   'Aigul Dzhaksybekova', 'a.djaksybekova@srl.kz', '+7 727 2550099',   'Block-train operator KZ-EU.'),
    ('00000000-0000-0000-0002-000000000003', 'apex-logistics',   'EuroAir Cargo',         'EACU',  'air',   'active',   'Marie Leblanc',   'marie.l@euroair.fr',        '+33 1 49000011',   NULL),
    ('00000000-0000-0000-0002-000000000004', 'apex-logistics',   'Fast Lane d.o.o.',      'FLDO',  'road',  'active',   'Ivan Horvat',     'i.horvat@fastlane.hr',      '+385 1 3660200',   'Balkans specialist.'),
    ('00000000-0000-0000-0002-000000000005', 'apex-logistics',   'Nordic Haulage AS',     'NHAS',  'road',  'inactive', 'Sven Lindqvist',  's.lindqvist@nordichaulage.no', '+47 22 334455', 'Contract expired Q1 2026.'),
    -- blue-freight
    ('00000000-0000-0000-0002-000000000006', 'blue-freight',     'OceanLink Shipping',    'OLSH',  'ocean', 'active',   'Chen Wei',        'cwei@oceanlink.com.cn',     '+86 21 65320000',  'FCL / LCL Shanghai-Hamburg.'),
    ('00000000-0000-0000-0002-000000000007', 'blue-freight',     'Atlas Road SRL',        'ATRL',  'road',  'active',   'Mihai Ionescu',   'm.ionescu@atlasroad.ro',    '+40 21 3100050',   NULL),
    ('00000000-0000-0000-0002-000000000008', 'blue-freight',     'Meridian Air Freight',  'MEAF',  'air',   'active',   'Priya Sharma',    'p.sharma@meridianair.in',   '+91 22 66990000',  'Charter capacity on request.'),
    ('00000000-0000-0000-0002-000000000009', 'blue-freight',     'HarbourRail Ltd',       'HRLT',  'rail',  'inactive', NULL,              NULL,                         NULL,               'Suspended pending audit.'),
    -- coastal-carriers
    ('00000000-0000-0000-0002-000000000010', 'coastal-carriers', 'BlueSea Container Co.', 'BSCC',  'ocean', 'active',   'Fatima Al-Rashid','f.alrashid@bluesea.ae',     '+971 4 3560100',   'Feeder services Black Sea-Med.'),
    ('00000000-0000-0000-0002-000000000011', 'coastal-carriers', 'Via Strada SRL',        'VSTR',  'road',  'active',   'Lucia Mancini',   'l.mancini@viastrada.it',    '+39 02 89000120',  NULL),
    ('00000000-0000-0000-0002-000000000012', 'coastal-carriers', 'SkyBridge Cargo',       'SKBR',  'air',   'active',   NULL,              NULL,                         NULL,               NULL)
) AS c(id, team_slug, name, code, mode, status, contact_name, contact_email, contact_phone, notes)
JOIN teams t ON t.slug = c.team_slug
ON CONFLICT (id) DO UPDATE
    SET name          = EXCLUDED.name,
        code          = EXCLUDED.code,
        mode          = EXCLUDED.mode,
        status        = EXCLUDED.status,
        contact_name  = EXCLUDED.contact_name,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone,
        notes         = EXCLUDED.notes,
        updated_at    = NOW();
