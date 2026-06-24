CREATE TABLE "customers" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"country_code" text NOT NULL,
	"mobile" text NOT NULL,
	"initial_users" integer NOT NULL,
	"id_connection" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email"),
	CONSTRAINT "customers_id_connection_unique" UNIQUE("id_connection")
);
--> statement-breakpoint
CREATE TABLE "ondemand_requests" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_code" text NOT NULL,
	"mobile" text NOT NULL,
	"id_connection" text NOT NULL,
	"request_from" text,
	"status" text DEFAULT 'initiated' NOT NULL,
	"ivalt_status_code" integer,
	"ivalt_response" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
