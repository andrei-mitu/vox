-- Seed: 002_workspace_data
-- Demo users, teams, memberships, access requests, carriers, clients, routes.
-- All user passwords: Password.1
-- Idempotent: safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

WITH u AS (
    INSERT INTO users (email, password_hash, email_confirmed_at)
        VALUES ('alice@demo.com', crypt('Password.1', gen_salt('bf', 12)), NOW()),
               ('bob@demo.com', crypt('Password.1', gen_salt('bf', 12)), NOW()),
               ('carol@demo.com', crypt('Password.1', gen_salt('bf', 12)), NOW()),
               ('dave@demo.com', crypt('Password.1', gen_salt('bf', 12)), NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email)
INSERT
INTO profiles (id, full_name, system_role)
SELECT id,
       CASE email
           WHEN 'alice@demo.com' THEN 'Alice Müller'
           WHEN 'bob@demo.com' THEN 'Bob Tanaka'
           WHEN 'carol@demo.com' THEN 'Carol Ndiaye'
           WHEN 'dave@demo.com' THEN 'Dave Osei'
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
VALUES ('00000000-0000-0000-0001-000000000001', 'Apex Logistics', 'apex-logistics', 'shared'),
       ('00000000-0000-0000-0001-000000000002', 'Blue Freight', 'blue-freight', 'shared'),
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
FROM (VALUES ('apex-logistics', 'alice@demo.com', 'owner' :: team_role),
             ('blue-freight', 'alice@demo.com', 'logistician' :: team_role),
             ('apex-logistics', 'bob@demo.com', 'logistician' :: team_role),
             ('blue-freight', 'carol@demo.com', 'owner' :: team_role),
             ('coastal-carriers', 'carol@demo.com', 'owner' :: team_role),
             ('coastal-carriers', 'dave@demo.com', 'logistician' :: team_role)) AS m(slug, email, role)
         JOIN teams t ON t.slug = m.slug
         JOIN users u ON u.email = m.email
ON CONFLICT (team_id, user_id) DO UPDATE
    SET role = EXCLUDED.role;

-- ---------------------------------------------------------------------------
-- Access requests
-- ---------------------------------------------------------------------------

INSERT INTO access_requests (email, full_name, company_name, message, status)
VALUES ('eve@globalship.com', 'Eve Larsson', 'GlobalShip Ltd', 'We need a multi-carrier solution for EU routes.',
        'pending'),
       ('frank@fastfreight.io', 'Frank Okafor', 'FastFreight', 'Looking to manage our FTL carriers in one place.',
        'pending'),
       ('grace@transco.net', 'Grace Kim', 'TransCo', NULL, 'approved'),
       ('henry@movemore.co', 'Henry Patel', 'MoveMore', 'Interested in the shipment tracking features.', 'rejected')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Carriers
-- ---------------------------------------------------------------------------

INSERT INTO carriers (id, team_id, name, code, mode, status, contact_name, contact_email, contact_phone, notes)
SELECT c.id::uuid,
       t.id,
       c.name,
       c.code,
       c.mode::carrier_mode,
       c.status::carrier_status,
       c.contact_name,
       c.contact_email,
       c.contact_phone,
       c.notes
FROM (VALUES
          -- apex-logistics
          ('00000000-0000-0000-0002-000000000001', 'apex-logistics', 'TransEurope GmbH', 'TREU', 'road', 'active',
           'Klaus Bauer', 'k.bauer@transeurope.de', '+49 89 21540000', 'Primary DE-RO lane partner.'),
          ('00000000-0000-0000-0002-000000000002', 'apex-logistics', 'Silk Road Logistics', 'SRL', 'rail', 'active',
           'Aigul Dzhaksybekova', 'a.djaksybekova@srl.kz', '+7 727 2550099', 'Block-train operator KZ-EU.'),
          ('00000000-0000-0000-0002-000000000003', 'apex-logistics', 'EuroAir Cargo', 'EACU', 'air', 'active',
           'Marie Leblanc', 'marie.l@euroair.fr', '+33 1 49000011', NULL),
          ('00000000-0000-0000-0002-000000000004', 'apex-logistics', 'Fast Lane d.o.o.', 'FLDO', 'road', 'active',
           'Ivan Horvat', 'i.horvat@fastlane.hr', '+385 1 3660200', 'Balkans specialist.'),
          ('00000000-0000-0000-0002-000000000005', 'apex-logistics', 'Nordic Haulage AS', 'NHAS', 'road', 'inactive',
           'Sven Lindqvist', 's.lindqvist@nordichaulage.no', '+47 22 334455', 'Contract expired Q1 2026.'),
          -- blue-freight
          ('00000000-0000-0000-0002-000000000006', 'blue-freight', 'OceanLink Shipping', 'OLSH', 'ocean', 'active',
           'Chen Wei', 'cwei@oceanlink.com.cn', '+86 21 65320000', 'FCL / LCL Shanghai-Hamburg.'),
          ('00000000-0000-0000-0002-000000000007', 'blue-freight', 'Atlas Road SRL', 'ATRL', 'road', 'active',
           'Mihai Ionescu', 'm.ionescu@atlasroad.ro', '+40 21 3100050', NULL),
          ('00000000-0000-0000-0002-000000000008', 'blue-freight', 'Meridian Air Freight', 'MEAF', 'air', 'active',
           'Priya Sharma', 'p.sharma@meridianair.in', '+91 22 66990000', 'Charter capacity on request.'),
          ('00000000-0000-0000-0002-000000000009', 'blue-freight', 'HarbourRail Ltd', 'HRLT', 'rail', 'inactive', NULL,
           NULL, NULL, 'Suspended pending audit.'),
          -- coastal-carriers
          ('00000000-0000-0000-0002-000000000010', 'coastal-carriers', 'BlueSea Container Co.', 'BSCC', 'ocean',
           'active', 'Fatima Al-Rashid', 'f.alrashid@bluesea.ae', '+971 4 3560100', 'Feeder services Black Sea-Med.'),
          ('00000000-0000-0000-0002-000000000011', 'coastal-carriers', 'Via Strada SRL', 'VSTR', 'road', 'active',
           'Lucia Mancini', 'l.mancini@viastrada.it', '+39 02 89000120', NULL),
          ('00000000-0000-0000-0002-000000000012', 'coastal-carriers', 'SkyBridge Cargo', 'SKBR', 'air', 'active', NULL,
           NULL, NULL, NULL)) AS c(id, team_slug, name, code, mode, status, contact_name, contact_email, contact_phone,
                                   notes)
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

-- ---------------------------------------------------------------------------
-- Clients
-- ---------------------------------------------------------------------------

INSERT INTO clients (id, team_id, name, contact_name, contact_email, contact_phone, billing_address, notes)
SELECT c.id::uuid,
       t.id,
       c.name,
       c.contact_name,
       c.contact_email,
       c.contact_phone,
       c.billing_address,
       c.notes
FROM (VALUES
          -- apex-logistics
          ('00000000-0000-0000-0003-000000000001', 'apex-logistics', 'Global Foods GmbH', 'Thomas Müller',
           't.mueller@globalfoods.de', '+49 30 88770000', 'Berliner Str. 12, 10115 Berlin, Germany',
           'Regular FTL customer, 30-day payment terms.'),
          ('00000000-0000-0000-0003-000000000002', 'apex-logistics', 'Agro Export SRL', 'Ion Popescu',
           'i.popescu@agroexport.ro', '+40 21 4100200', 'Calea Victoriei 45, 010065 Bucharest, Romania', NULL),
          ('00000000-0000-0000-0003-000000000003', 'apex-logistics', 'NordTech Industries AS', 'Ingrid Haug',
           'i.haug@nordtech.no', '+47 22 801100', 'Drammensveien 60, 0271 Oslo, Norway',
           'Prefers rail for heavy machinery.'),
          ('00000000-0000-0000-0003-000000000004', 'apex-logistics', 'Silk Valley Trading LLC', NULL, NULL, NULL, NULL,
           'New prospect, intro call scheduled.'),
          -- blue-freight
          ('00000000-0000-0000-0003-000000000005', 'blue-freight', 'Shanghai Electrics Co.', 'Li Wei',
           'l.wei@shelectrics.com.cn', '+86 21 64300000', '1000 Lujiazui Ring Rd, Pudong, Shanghai',
           'FCL only, 45-day terms.'),
          ('00000000-0000-0000-0003-000000000006', 'blue-freight', 'Mediterranean Olive SRL', 'Maria Costa',
           'm.costa@mediterrolive.it', '+39 091 3340100', 'Via Roma 88, 90133 Palermo, Italy', NULL),
          ('00000000-0000-0000-0003-000000000007', 'blue-freight', 'Atlas Pharma SA', 'Leila Benali',
           'l.benali@atlaspharma.ma', '+212 522 980000', 'Bd Zerktouni 23, 20100 Casablanca, Morocco',
           'Temperature-controlled shipments only.'),
          -- coastal-carriers
          ('00000000-0000-0000-0003-000000000008', 'coastal-carriers', 'Black Sea Grains Ltd', 'Olena Kovalenko',
           'o.kovalenko@bsgrains.ua', '+380 44 5010100', 'Khreshchatyk St 1, 01001 Kyiv, Ukraine',
           'Bulk grain, seasonal volumes.'),
          ('00000000-0000-0000-0003-000000000009', 'coastal-carriers', 'Adriatic Wine Exports', 'Marco Bianchi',
           'm.bianchi@adriaticwine.hr', '+385 20 441000', 'Stradun 5, 20000 Dubrovnik, Croatia', NULL)) AS c(id,
                                                                                                             team_slug,
                                                                                                             name,
                                                                                                             contact_name,
                                                                                                             contact_email,
                                                                                                             contact_phone,
                                                                                                             billing_address,
                                                                                                             notes)
         JOIN teams t ON t.slug = c.team_slug
ON CONFLICT (id) DO UPDATE
    SET name            = EXCLUDED.name,
        contact_name    = EXCLUDED.contact_name,
        contact_email   = EXCLUDED.contact_email,
        contact_phone   = EXCLUDED.contact_phone,
        billing_address = EXCLUDED.billing_address,
        notes           = EXCLUDED.notes,
        updated_at      = NOW();

-- ---------------------------------------------------------------------------
-- Routes
-- ---------------------------------------------------------------------------


INSERT INTO routes (id, team_id, origin_city, origin_country, dest_city, dest_country, distance_km, transit_days, notes)
SELECT r.id::uuid,
       t.id,
       r.origin_city,
       r.origin_country,
       r.dest_city,
       r.dest_country,
       r.distance_km::int,
       r.transit_days::int,
       r.notes
FROM (VALUES
          -- apex-logistics
          ('00000000-0000-0000-0004-000000000001', 'apex-logistics', 'Berlin', 'Germany', 'Bucharest', 'Romania',
           '1850', '3', 'Main outbound lane for automotive parts.'),
          ('00000000-0000-0000-0004-000000000002', 'apex-logistics', 'Hamburg', 'Germany', 'Warsaw', 'Poland', '690',
           '1', NULL),
          ('00000000-0000-0000-0004-000000000003', 'apex-logistics', 'Frankfurt', 'Germany', 'Almaty', 'Kazakhstan',
           '6200', '14', 'Block-train via Silk Road Logistics.'),
          ('00000000-0000-0000-0004-000000000004', 'apex-logistics', 'Frankfurt', 'Germany', 'Paris', 'France', '480',
           '1', NULL),
          ('00000000-0000-0000-0004-000000000005', 'apex-logistics', 'Oslo', 'Norway', 'Munich', 'Germany', '1580', '2',
           NULL),
          -- blue-freight
          ('00000000-0000-0000-0004-000000000006', 'blue-freight', 'Shanghai', 'China', 'Hamburg', 'Germany', '20100',
           '28', 'FCL service via Suez Canal.'),
          ('00000000-0000-0000-0004-000000000007', 'blue-freight', 'Shanghai', 'China', 'Rotterdam', 'Netherlands',
           '20800', '30', NULL),
          ('00000000-0000-0000-0004-000000000008', 'blue-freight', 'Casablanca', 'Morocco', 'Hamburg', 'Germany',
           '4850', '8', NULL),
          ('00000000-0000-0000-0004-000000000009', 'blue-freight', 'Mumbai', 'India', 'Frankfurt', 'Germany', '7150',
           '2', 'Air charter via Meridian Air Freight.'),
          ('00000000-0000-0000-0004-000000000010', 'blue-freight', 'Bucharest', 'Romania', 'Milan', 'Italy', '1650',
           '2', NULL),
          -- coastal-carriers
          ('00000000-0000-0000-0004-000000000011', 'coastal-carriers', 'Kyiv', 'Ukraine', 'Constanta', 'Romania', '490',
           '1', 'Road link to Black Sea port.'),
          ('00000000-0000-0000-0004-000000000012', 'coastal-carriers', 'Odessa', 'Ukraine', 'Istanbul', 'Turkey', '540',
           '2', 'Feeder vessel via BlueSea Container Co.'),
          ('00000000-0000-0000-0004-000000000013', 'coastal-carriers', 'Dubrovnik', 'Croatia', 'Venice', 'Italy', '275',
           '1', NULL),
          ('00000000-0000-0000-0004-000000000014', 'coastal-carriers', 'Istanbul', 'Turkey', 'Rome', 'Italy', '1840',
           '1', 'Air via SkyBridge Cargo.')) AS r(id, team_slug, origin_city, origin_country, dest_city, dest_country,
                                                  distance_km, transit_days, notes)
         JOIN teams t ON t.slug = r.team_slug
ON CONFLICT (id) DO UPDATE
    SET origin_city    = EXCLUDED.origin_city,
        origin_country = EXCLUDED.origin_country,
        dest_city      = EXCLUDED.dest_city,
        dest_country   = EXCLUDED.dest_country,
        distance_km    = EXCLUDED.distance_km,
        transit_days   = EXCLUDED.transit_days,
        notes          = EXCLUDED.notes,
        updated_at     = NOW();

-- ---------------------------------------------------------------------------
-- Trips
-- ---------------------------------------------------------------------------

INSERT INTO trips (id, team_id, created_by, status,
                   cargo_name, cargo_type, weight_kg, volume_m3,
                   thermal, temp_min, temp_max, thermodiagram,
                   adr, adr_class,
                   phytosanitary, phyto_cost_by,
                   client_id, client_name, contact_person, contact_phone, contact_email,
                   price, currency, payment_period,
                   loading_address, loading_customs, unloading_address, unloading_customs,
                   loading_date_from, loading_date_to,
                   comments)
SELECT d.id::uuid,
       t.id,
       u.id,
       d.status::trip_status,
       d.cargo_name,
       d.cargo_type,
       NULLIF(d.weight_kg, '')::numeric,
       NULLIF(d.volume_m3, '')::numeric,
       d.thermal::boolean,
       NULLIF(d.temp_min, '')::numeric,
       NULLIF(d.temp_max, '')::numeric,
       d.thermodiagram::boolean,
       d.adr::boolean,
       NULLIF(d.adr_class, ''),
       d.phytosanitary::boolean,
       NULLIF(d.phyto_cost_by, '')::phyto_cost_by,
       NULLIF(d.client_id, '')::uuid,
       NULLIF(d.client_name, ''),
       NULLIF(d.contact_person, ''),
       NULLIF(d.contact_phone, ''),
       NULLIF(d.contact_email, ''),
       NULLIF(d.price, '')::numeric,
       d.currency,
       NULLIF(d.payment_period, '')::integer,
       NULLIF(d.loading_address, ''),
       NULLIF(d.loading_customs, ''),
       NULLIF(d.unloading_address, ''),
       NULLIF(d.unloading_customs, ''),
       NULLIF(d.loading_date_from, '')::date,
       NULLIF(d.loading_date_to, '')::date,
       NULLIF(d.comments, '')
FROM (VALUES
          -- apex-logistics / alice
          ('00000000-0000-0000-0005-000000000001', 'apex-logistics', 'alice@demo.com', 'CREATED',
           'Machine Parts', 'Industrial equipment', '18500.00', '62.00',
           'false', '', '', 'false',
           'false', '',
           'false', '',
           '00000000-0000-0000-0003-000000000001', 'Global Foods GmbH', 'Thomas Müller', '+49 30 88770000',
           't.mueller@globalfoods.de',
           '4200.00', 'EUR', '30',
           'Siemensstr. 1, 10551 Berlin, Germany', 'Forst Customs',
           'Calea Victoriei 45, 010065 Bucharest, Romania', 'Albita Customs',
           '2026-05-12', '2026-05-14',
           'Handle with care — precision components.'),

          ('00000000-0000-0000-0005-000000000002', 'apex-logistics', 'bob@demo.com', 'CARRIER_ASSIGNED',
           'Automotive Gearboxes', 'Auto parts', '22000.00', '48.00',
           'false', '', '', 'false',
           'false', '',
           'false', '',
           '00000000-0000-0000-0003-000000000002', 'Agro Export SRL', 'Ion Popescu', '+40 21 4100200',
           'i.popescu@agroexport.ro',
           '5800.00', 'EUR', '45',
           'Porschestr. 911, 70435 Stuttgart, Germany', '',
           'Str. Industriilor 22, 077190 Voluntari, Romania', 'Albita Customs',
           '2026-05-08', '2026-05-10',
           ''),

          ('00000000-0000-0000-0005-000000000003', 'apex-logistics', 'alice@demo.com', 'MONITORING',
           'Frozen Vegetables', 'Food — frozen', '14000.00', '54.00',
           'true', '-22.0', '-18.0', 'true',
           'false', '',
           'true', 'CARRIER',
           '00000000-0000-0000-0003-000000000003', 'NordTech Industries AS', 'Ingrid Haug', '+47 22 801100',
           'i.haug@nordtech.no',
           '6100.00', 'EUR', '30',
           'Konopnickiej 5, 00-491 Warsaw, Poland', '',
           'Drammensveien 60, 0271 Oslo, Norway', '',
           '2026-04-28', '2026-04-30',
           'Thermodiagram required at unloading.'),

          ('00000000-0000-0000-0005-000000000004', 'apex-logistics', 'bob@demo.com', 'AWAITING_PAYMENT',
           'Bagged Wheat', 'Agricultural', '26000.00', '90.00',
           'false', '', '', 'false',
           'false', '',
           'true', 'SENDER',
           '', 'Silk Valley Trading LLC', '', '', '',
           '3750.00', 'USD', '60',
           'Almaty Free Zone, Kazakhstan', '', 'Frankfurt Osthafen, Germany', '',
           '2026-04-10', '2026-04-24',
           ''),

          ('00000000-0000-0000-0005-000000000005', 'apex-logistics', 'alice@demo.com', 'COMPLETED',
           'Consumer Electronics', 'Electronics', '8200.00', '38.00',
           'false', '', '', 'false',
           'false', '',
           'false', '',
           '00000000-0000-0000-0003-000000000001', 'Global Foods GmbH', 'Thomas Müller', '+49 30 88770000',
           't.mueller@globalfoods.de',
           '3900.00', 'EUR', '30',
           'Parc des Expositions, Paris, France', '',
           'Berliner Str. 12, 10115 Berlin, Germany', '',
           '2026-03-15', '2026-03-16',
           'Delivered on time, no issues.'),

          -- blue-freight / carol
          ('00000000-0000-0000-0005-000000000006', 'blue-freight', 'carol@demo.com', 'CREATED',
           'Container — General Cargo', 'Mixed goods', '20000.00', '67.00',
           'false', '', '', 'false',
           'false', '',
           'false', '',
           '00000000-0000-0000-0003-000000000005', 'Shanghai Electrics Co.', 'Li Wei', '+86 21 64300000',
           'l.wei@shelectrics.com.cn',
           '8500.00', 'USD', '45',
           '1000 Lujiazui Ring Rd, Pudong, Shanghai, China', 'Shanghai Port Customs',
           'Australiastraße 3, 20457 Hamburg, Germany', 'Hamburg Customs',
           '2026-06-01', '2026-06-29',
           'FCL 40HC. Booking HLCU123456.'),

          ('00000000-0000-0000-0005-000000000007', 'blue-freight', 'carol@demo.com', 'CARRIER_ASSIGNED',
           'Pharmaceutical Compounds', 'Pharma — temperature sensitive', '5500.00', '22.00',
           'true', '2.0', '8.0', 'true',
           'false', '',
           'true', 'CARRIER',
           '00000000-0000-0000-0003-000000000007', 'Atlas Pharma SA', 'Leila Benali', '+212 522 980000',
           'l.benali@atlaspharma.ma',
           '12400.00', 'EUR', '30',
           'Bd Zerktouni 23, 20100 Casablanca, Morocco', 'Casablanca Airport Customs',
           'Pharma Park, 60549 Frankfurt, Germany', 'Frankfurt Airport Customs',
           '2026-05-20', '2026-05-21',
           'Air freight. GDP-compliant packaging mandatory.'),

          -- coastal-carriers / carol
          ('00000000-0000-0000-0005-000000000008', 'coastal-carriers', 'carol@demo.com', 'CREATED',
           'Winter Wheat', 'Bulk agricultural', '28000.00', '95.00',
           'false', '', '', 'false',
           'false', '',
           'true', 'SENDER',
           '00000000-0000-0000-0003-000000000008', 'Black Sea Grains Ltd', 'Olena Kovalenko', '+380 44 5010100',
           'o.kovalenko@bsgrains.ua',
           '4100.00', 'USD', '60',
           'Khreshchatyk St 1, 01001 Kyiv, Ukraine', '',
           'Port of Constanta, Romania', 'Constanta Customs',
           '2026-05-25', '2026-05-27',
           'Phyto cert issued by Ukrainian authority.'),

          ('00000000-0000-0000-0005-000000000009', 'coastal-carriers', 'dave@demo.com', 'COMPLETED',
           'Premium Wine — Assorted', 'Food & Beverage', '9000.00', '34.00',
           'false', '', '', 'false',
           'false', '',
           'false', '',
           '00000000-0000-0000-0003-000000000009', 'Adriatic Wine Exports', 'Marco Bianchi', '+385 20 441000',
           'm.bianchi@adriaticwine.hr',
           '2800.00', 'EUR', '30',
           'Stradun 5, 20000 Dubrovnik, Croatia', '',
           'Fondamenta delle Zattere, 30123 Venice, Italy', '',
           '2026-04-02', '2026-04-03',
           'Completed without incidents.')) AS d(
                                                 id, team_slug, user_email, status,
                                                 cargo_name, cargo_type, weight_kg, volume_m3,
                                                 thermal, temp_min, temp_max, thermodiagram,
                                                 adr, adr_class,
                                                 phytosanitary, phyto_cost_by,
                                                 client_id, client_name, contact_person, contact_phone, contact_email,
                                                 price, currency, payment_period,
                                                 loading_address, loading_customs, unloading_address, unloading_customs,
                                                 loading_date_from, loading_date_to,
                                                 comments
    )
         JOIN teams t ON t.slug = d.team_slug
         JOIN users u ON u.email = d.user_email
ON CONFLICT (id) DO UPDATE
    SET status            = EXCLUDED.status,
        cargo_name        = EXCLUDED.cargo_name,
        cargo_type        = EXCLUDED.cargo_type,
        weight_kg         = EXCLUDED.weight_kg,
        volume_m3         = EXCLUDED.volume_m3,
        thermal           = EXCLUDED.thermal,
        temp_min          = EXCLUDED.temp_min,
        temp_max          = EXCLUDED.temp_max,
        thermodiagram     = EXCLUDED.thermodiagram,
        adr               = EXCLUDED.adr,
        adr_class         = EXCLUDED.adr_class,
        phytosanitary     = EXCLUDED.phytosanitary,
        phyto_cost_by     = EXCLUDED.phyto_cost_by,
        client_id         = EXCLUDED.client_id,
        client_name       = EXCLUDED.client_name,
        contact_person    = EXCLUDED.contact_person,
        contact_phone     = EXCLUDED.contact_phone,
        contact_email     = EXCLUDED.contact_email,
        price             = EXCLUDED.price,
        currency          = EXCLUDED.currency,
        payment_period    = EXCLUDED.payment_period,
        loading_address   = EXCLUDED.loading_address,
        loading_customs   = EXCLUDED.loading_customs,
        unloading_address = EXCLUDED.unloading_address,
        unloading_customs = EXCLUDED.unloading_customs,
        loading_date_from = EXCLUDED.loading_date_from,
        loading_date_to   = EXCLUDED.loading_date_to,
        comments          = EXCLUDED.comments,
        updated_at        = NOW();
