-- Seed: 004_clients
-- Mock clients for the three demo teams.
-- Idempotent: safe to run multiple times.

INSERT INTO clients (id, team_id, name, contact_name, contact_email, contact_phone, billing_address, notes)
SELECT c.id::uuid, t.id, c.name, c.contact_name, c.contact_email, c.contact_phone, c.billing_address, c.notes
FROM (VALUES
    -- apex-logistics
    ('00000000-0000-0000-0003-000000000001', 'apex-logistics',   'Global Foods GmbH',        'Thomas Müller',   't.mueller@globalfoods.de',   '+49 30 88770000', 'Berliner Str. 12, 10115 Berlin, Germany',       'Regular FTL customer, 30-day payment terms.'),
    ('00000000-0000-0000-0003-000000000002', 'apex-logistics',   'Agro Export SRL',          'Ion Popescu',     'i.popescu@agroexport.ro',    '+40 21 4100200',  'Calea Victoriei 45, 010065 Bucharest, Romania', NULL),
    ('00000000-0000-0000-0003-000000000003', 'apex-logistics',   'NordTech Industries AS',   'Ingrid Haug',     'i.haug@nordtech.no',         '+47 22 801100',   'Drammensveien 60, 0271 Oslo, Norway',           'Prefers rail for heavy machinery.'),
    ('00000000-0000-0000-0003-000000000004', 'apex-logistics',   'Silk Valley Trading LLC',  NULL,              NULL,                         NULL,              NULL,                                            'New prospect, intro call scheduled.'),
    -- blue-freight
    ('00000000-0000-0000-0003-000000000005', 'blue-freight',     'Shanghai Electrics Co.',   'Li Wei',          'l.wei@shelectrics.com.cn',   '+86 21 64300000', '1000 Lujiazui Ring Rd, Pudong, Shanghai',       'FCL only, 45-day terms.'),
    ('00000000-0000-0000-0003-000000000006', 'blue-freight',     'Mediterranean Olive SRL',  'Maria Costa',     'm.costa@mediterrolive.it',   '+39 091 3340100', 'Via Roma 88, 90133 Palermo, Italy',             NULL),
    ('00000000-0000-0000-0003-000000000007', 'blue-freight',     'Atlas Pharma SA',          'Leila Benali',    'l.benali@atlaspharma.ma',    '+212 522 980000', 'Bd Zerktouni 23, 20100 Casablanca, Morocco',   'Temperature-controlled shipments only.'),
    -- coastal-carriers
    ('00000000-0000-0000-0003-000000000008', 'coastal-carriers', 'Black Sea Grains Ltd',     'Olena Kovalenko', 'o.kovalenko@bsgrains.ua',    '+380 44 5010100', 'Khreshchatyk St 1, 01001 Kyiv, Ukraine',       'Bulk grain, seasonal volumes.'),
    ('00000000-0000-0000-0003-000000000009', 'coastal-carriers', 'Adriatic Wine Exports',    'Marco Bianchi',   'm.bianchi@adriaticwine.hr',  '+385 20 441000',  'Stradun 5, 20000 Dubrovnik, Croatia',          NULL)
) AS c(id, team_slug, name, contact_name, contact_email, contact_phone, billing_address, notes)
JOIN teams t ON t.slug = c.team_slug
ON CONFLICT (id) DO UPDATE
    SET name            = EXCLUDED.name,
        contact_name    = EXCLUDED.contact_name,
        contact_email   = EXCLUDED.contact_email,
        contact_phone   = EXCLUDED.contact_phone,
        billing_address = EXCLUDED.billing_address,
        notes           = EXCLUDED.notes,
        updated_at      = NOW();
