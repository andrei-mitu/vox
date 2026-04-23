CREATE TABLE "routes"
(
    "id"             uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
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
ALTER TABLE "routes"
    ADD CONSTRAINT "routes_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_routes_team_id" ON "routes" USING btree ("team_id");
