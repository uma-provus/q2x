CREATE TABLE "tenant_field_definitions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "tenant_id" uuid NOT NULL,
    "entity_type" text NOT NULL,
    "field_key" text NOT NULL,
    "label" text NOT NULL,
    "description" text,
    "data_type" text NOT NULL,
    "required" boolean DEFAULT false NOT NULL,
    "searchable" boolean DEFAULT false NOT NULL,
    "option_set_id" uuid,
    "default_value" jsonb,
    "ui_config" jsonb,
    "is_archived" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_option_set_options" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "option_set_id" uuid NOT NULL,
    "option_key" text NOT NULL,
    "label" text NOT NULL,
    "description" text,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_option_sets" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "tenant_id" uuid NOT NULL,
    "name" text NOT NULL,
    "entity_type" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_field_definitions"
ADD CONSTRAINT "tenant_field_definitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants" ("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tenant_field_definitions"
ADD CONSTRAINT "tenant_field_definitions_option_set_id_tenant_option_sets_id_fk" FOREIGN KEY ("option_set_id") REFERENCES "public"."tenant_option_sets" ("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tenant_option_set_options"
ADD CONSTRAINT "tenant_option_set_options_option_set_id_tenant_option_sets_id_fk" FOREIGN KEY ("option_set_id") REFERENCES "public"."tenant_option_sets" ("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tenant_option_sets"
ADD CONSTRAINT "tenant_option_sets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants" ("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tenant_option_sets"
ADD CONSTRAINT "tenant_option_sets_tenant_id_name_unique" UNIQUE ("tenant_id", "name");
--> statement-breakpoint
ALTER TABLE "tenant_option_set_options"
ADD CONSTRAINT "tenant_option_set_options_option_set_id_option_key_unique" UNIQUE ("option_set_id", "option_key");
--> statement-breakpoint
ALTER TABLE "tenant_field_definitions"
ADD CONSTRAINT "tenant_field_definitions_tenant_id_entity_type_field_key_unique" UNIQUE (
    "tenant_id",
    "entity_type",
    "field_key"
);
--> statement-breakpoint
ALTER TABLE "tenant_field_definitions"
ADD CONSTRAINT "tenant_field_definitions_enum_option_set_check" CHECK (
    (
        data_type IN ('enum', 'multienum')
        AND option_set_id IS NOT NULL
    )
    OR (
        data_type NOT IN ('enum', 'multienum')
    )
);