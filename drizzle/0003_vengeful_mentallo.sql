CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"tags" text[],
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" RENAME TO "contacts";--> statement-breakpoint
ALTER TABLE "contacts" DROP CONSTRAINT "customers_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "company_id" uuid;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "contact_id" uuid;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "postal_code";--> statement-breakpoint
ALTER TABLE "quotes" DROP COLUMN "customer_id";--> statement-breakpoint
ALTER TABLE "quotes" DROP COLUMN "customer_name";