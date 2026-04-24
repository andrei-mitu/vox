CREATE TYPE "public"."access_request_status" AS ENUM ('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."carrier_mode" AS ENUM ('air', 'ocean', 'road', 'rail');--> statement-breakpoint
CREATE TYPE "public"."carrier_status" AS ENUM ('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."system_role" AS ENUM ('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM ('owner', 'logistician');--> statement-breakpoint
CREATE TYPE "public"."team_visibility" AS ENUM ('shared', 'private');--> statement-breakpoint
CREATE TYPE "public"."phyto_cost_by" AS ENUM ('CARRIER', 'SENDER');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM ('CREATED', 'CARRIER_ASSIGNED', 'MONITORING', 'AWAITING_PAYMENT', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "access_requests"
(
    "id"           uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
    "email"        text                                               NOT NULL,
    "full_name"    text                                               NOT NULL,
    "company_name" text                                               NOT NULL,
    "message"      text,
    "status"       "access_request_status"  DEFAULT 'pending'         NOT NULL,
    "reviewed_at"  timestamp with time zone,
    "reviewed_by"  uuid,
    "created_at"   timestamp with time zone DEFAULT now()             NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carriers"
(
    "id"            uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
    "seq_id"        bigserial                                          NOT NULL,
    "team_id"       uuid                                               NOT NULL,
    "name"          text                                               NOT NULL,
    "code"          text                                               NOT NULL,
    "mode"          "carrier_mode"                                     NOT NULL,
    "status"        "carrier_status"         DEFAULT 'active'          NOT NULL,
    "contact_name"  text,
    "contact_email" text,
    "contact_phone" text,
    "notes"         text,
    "created_at"    timestamp with time zone DEFAULT now()             NOT NULL,
    "updated_at"    timestamp with time zone DEFAULT now()             NOT NULL,
    CONSTRAINT "carriers_team_code_unique" UNIQUE ("team_id", "code")
);
--> statement-breakpoint
CREATE TABLE "clients"
(
    "id"              uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
    "seq_id"          bigserial                                          NOT NULL,
    "team_id"         uuid                                               NOT NULL,
    "name"            text                                               NOT NULL,
    "contact_name"    text,
    "contact_email"   text,
    "contact_phone"   text,
    "billing_address" text,
    "notes"           text,
    "created_at"      timestamp with time zone DEFAULT now()             NOT NULL,
    "updated_at"      timestamp with time zone DEFAULT now()             NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles"
(
    "id"          uuid PRIMARY KEY                        NOT NULL,
    "full_name"   text                     DEFAULT ''     NOT NULL,
    "system_role" "system_role"            DEFAULT 'user' NOT NULL,
    "created_at"  timestamp with time zone DEFAULT now()  NOT NULL,
    "updated_at"  timestamp with time zone DEFAULT now()  NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes"
(
    "id"             uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
    "seq_id"         bigserial                                          NOT NULL,
    "team_id"        uuid                                               NOT NULL,
    "origin_city"    text                                               NOT NULL,
    "origin_country" text                                               NOT NULL,
    "dest_city"      text                                               NOT NULL,
    "dest_country"   text                                               NOT NULL,
    "distance_km"    integer,
    "transit_days"   integer,
    "notes"          text,
    "created_at"     timestamp with time zone DEFAULT now()             NOT NULL,
    "updated_at"     timestamp with time zone DEFAULT now()             NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members"
(
    "id"        uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
    "team_id"   uuid                                               NOT NULL,
    "user_id"   uuid                                               NOT NULL,
    "role"      "team_role"              DEFAULT 'logistician'     NOT NULL,
    "joined_at" timestamp with time zone DEFAULT now()             NOT NULL,
    CONSTRAINT "team_members_team_id_user_id_unique" UNIQUE ("team_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE "teams"
(
    "id"         uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
    "name"       text                                               NOT NULL,
    "slug"       text                                               NOT NULL,
    "logo_url"   text,
    "visibility" "team_visibility"        DEFAULT 'shared'          NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()             NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now()             NOT NULL,
    CONSTRAINT "teams_slug_unique" UNIQUE ("slug")
);
--> statement-breakpoint
CREATE TABLE "trips"
(
    "id"                uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
    "seq_id"            bigserial                                          NOT NULL,
    "team_id"           uuid                                               NOT NULL,
    "created_by"        uuid                                               NOT NULL,
    "status"            "trip_status"            DEFAULT 'CREATED'         NOT NULL,
    "cargo_name"        text                                               NOT NULL,
    "cargo_type"        text,
    "weight_kg"         numeric(10, 2),
    "volume_m3"         numeric(10, 2),
    "thermal"           boolean                  DEFAULT false             NOT NULL,
    "temp_min"          numeric(5, 1),
    "temp_max"          numeric(5, 1),
    "thermodiagram"     boolean                  DEFAULT false             NOT NULL,
    "adr"               boolean                  DEFAULT false             NOT NULL,
    "adr_class"         text,
    "phytosanitary"     boolean                  DEFAULT false             NOT NULL,
    "phyto_cost_by"     "phyto_cost_by",
    "client_id"         uuid,
    "client_name"       text,
    "contact_person"    text,
    "contact_phone"     text,
    "contact_email"     text,
    "price"             numeric(12, 2),
    "currency"          char(3)                  DEFAULT 'EUR'             NOT NULL,
    "payment_period"    integer,
    "loading_address"   text,
    "loading_customs"   text,
    "unloading_address" text,
    "unloading_customs" text,
    "loading_date_from" date,
    "loading_date_to"   date,
    "comments"          text,
    "created_at"        timestamp with time zone DEFAULT now()             NOT NULL,
    "updated_at"        timestamp with time zone DEFAULT now()             NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"
(
    "id"                 uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
    "email"              text                                               NOT NULL,
    "password_hash"      text                                               NOT NULL,
    "email_confirmed_at" timestamp with time zone,
    "banned_until"       timestamp with time zone,
    "created_at"         timestamp with time zone DEFAULT now()             NOT NULL,
    "updated_at"         timestamp with time zone DEFAULT now()             NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
ALTER TABLE "access_requests"
    ADD CONSTRAINT "access_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carriers"
    ADD CONSTRAINT "carriers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients"
    ADD CONSTRAINT "clients_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles"
    ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes"
    ADD CONSTRAINT "routes_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members"
    ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members"
    ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips"
    ADD CONSTRAINT "trips_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips"
    ADD CONSTRAINT "trips_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips"
    ADD CONSTRAINT "trips_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_access_requests_status" ON "access_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_access_requests_email" ON "access_requests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_access_requests_reviewed_by" ON "access_requests" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "idx_carriers_team_id" ON "carriers" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_carriers_status" ON "carriers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_clients_team_id" ON "clients" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_routes_team_id" ON "routes" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_team_members_user_id" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_team_members_team_id" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_trips_team_id" ON "trips" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_trips_status" ON "trips" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_trips_created_by" ON "trips" USING btree ("created_by");
