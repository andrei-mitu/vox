CREATE TYPE "public"."carrier_mode" AS ENUM('air', 'ocean', 'road', 'rail');--> statement-breakpoint
CREATE TYPE "public"."carrier_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "carriers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"mode" "carrier_mode" NOT NULL,
	"status" "carrier_status" DEFAULT 'active' NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carriers_team_code_unique" UNIQUE("team_id","code")
);
--> statement-breakpoint
ALTER TABLE "carriers" ADD CONSTRAINT "carriers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_carriers_team_id" ON "carriers" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_carriers_status" ON "carriers" USING btree ("status");