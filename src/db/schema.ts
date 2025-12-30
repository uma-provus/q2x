import { relations, sql } from "drizzle-orm";
import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    notificationSettings: jsonb("notification_settings"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        tenantId: uuid("tenant_id")
            .references(() => tenants.id)
            .notNull(),
        email: text("email").notNull(),
        passwordHash: text("password_hash"),
        name: text("name").notNull(),
        status: text("status", { enum: ["active", "invited", "disabled"] })
            .default("active")
            .notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        tenantEmailUnique: sql`UNIQUE (${table.tenantId}, ${table.email})`,
    }),
);

export const roles = pgTable("roles", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name", { enum: ["admin", "sales", "finance", "viewer"] })
        .notNull()
        .unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRoles = pgTable(
    "user_roles",
    {
        tenantId: uuid("tenant_id")
            .references(() => tenants.id)
            .notNull(),
        userId: uuid("user_id")
            .references(() => users.id)
            .notNull(),
        roleId: uuid("role_id")
            .references(() => roles.id)
            .notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
        pk: sql`PRIMARY KEY (${table.tenantId}, ${table.userId}, ${table.roleId})`,
    }),
);

export const catalogItems = pgTable("catalog_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
        .references(() => tenants.id)
        .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").notNull(), // References a type key defined in tenant settings
    unitCost: text("unit_cost").notNull(), // Using text for decimal precision or use decimal type
    unitPrice: text("unit_price").notNull(),
    unitType: text("unit_type").notNull(),
    tags: text("tags").array(),
    customFields: jsonb("custom_fields"),
    currency: text("currency").default("USD").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
        .references(() => tenants.id)
        .notNull(),
    name: text("name").notNull(),
    website: text("website"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    country: text("country"),
    postalCode: text("postal_code"),
    tags: text("tags").array(),
    customFields: jsonb("custom_fields"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
        .references(() => tenants.id)
        .notNull(),
    companyId: uuid("company_id")
        .references(() => companies.id)
        .notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    title: text("title"), // Job title
    isPrimary: boolean("is_primary").default(false).notNull(),
    tags: text("tags").array(),
    customFields: jsonb("custom_fields"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
        .references(() => tenants.id)
        .notNull(),
    quoteNumber: text("quote_number").notNull(),
    title: text("title").notNull(),
    companyId: uuid("company_id").references(() => companies.id),
    contactId: uuid("contact_id").references(() => contacts.id),
    status: text("status").notNull(), // References a status key defined in tenant settings
    totalAmount: text("total_amount").notNull(),
    currency: text("currency").default("USD").notNull(),
    validUntil: timestamp("valid_until"),
    notes: text("notes"),
    tags: text("tags").array(),
    customFields: jsonb("custom_fields"),
    createdBy: uuid("created_by")
        .references(() => users.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenant custom fields and option sets
export const tenantOptionSets = pgTable(
    "tenant_option_sets",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        tenantId: uuid("tenant_id")
            .references(() => tenants.id)
            .notNull(),
        name: text("name").notNull(), // e.g. "catalog_item_type", "quote_status"
        entityType: text("entity_type"), // optional, for organization
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        tenantNameUnique: sql`UNIQUE (${table.tenantId}, ${table.name})`,
    }),
);

export const tenantOptionSetOptions = pgTable(
    "tenant_option_set_options",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        optionSetId: uuid("option_set_id")
            .references(() => tenantOptionSets.id)
            .notNull(),
        optionKey: text("option_key").notNull(), // stable key: "product", "draft", etc
        label: text("label").notNull(), // tenant-changeable display label
        description: text("description"),
        color: text("color"), // optional color for UI display
        sortOrder: integer("sort_order").default(0).notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        optionSetKeyUnique: sql`UNIQUE (${table.optionSetId}, ${table.optionKey})`,
    }),
);

export const tenantFieldDefinitions = pgTable(
    "tenant_field_definitions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        tenantId: uuid("tenant_id")
            .references(() => tenants.id)
            .notNull(),
        entityType: text("entity_type").notNull(), // "company" | "contact" | "catalog_item" | "quote"
        fieldKey: text("field_key").notNull(), // stable snake_case, immutable
        label: text("label").notNull(),
        description: text("description"),
        dataType: text("data_type").notNull(), // "string","number","boolean","date","datetime","currency","email","phone","url","longtext","json","enum","multienum"
        required: boolean("required").default(false).notNull(),
        searchable: boolean("searchable").default(false).notNull(),
        optionSetId: uuid("option_set_id").references(() => tenantOptionSets.id), // required for enum/multienum
        defaultValue: jsonb("default_value"),
        uiConfig: jsonb("ui_config"), // placeholder, columnWidth, helpText, etc.
        isArchived: boolean("is_archived").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        tenantEntityFieldUnique: sql`UNIQUE (${table.tenantId}, ${table.entityType}, ${table.fieldKey})`,
        enumOptionSetCheck: sql`CHECK (
            (${table.dataType} IN ('enum', 'multienum') AND ${table.optionSetId} IS NOT NULL) OR
            (${table.dataType} NOT IN ('enum', 'multienum'))
        )`,
    }),
);

// Relations
export const tenantOptionSetsRelations = relations(
    tenantOptionSets,
    ({ one, many }) => ({
        tenant: one(tenants, {
            fields: [tenantOptionSets.tenantId],
            references: [tenants.id],
        }),
        options: many(tenantOptionSetOptions),
    }),
);

export const tenantOptionSetOptionsRelations = relations(
    tenantOptionSetOptions,
    ({ one }) => ({
        optionSet: one(tenantOptionSets, {
            fields: [tenantOptionSetOptions.optionSetId],
            references: [tenantOptionSets.id],
        }),
    }),
);

export const tenantFieldDefinitionsRelations = relations(
    tenantFieldDefinitions,
    ({ one }) => ({
        tenant: one(tenants, {
            fields: [tenantFieldDefinitions.tenantId],
            references: [tenants.id],
        }),
        optionSet: one(tenantOptionSets, {
            fields: [tenantFieldDefinitions.optionSetId],
            references: [tenantOptionSets.id],
        }),
    }),
);
