import { sql } from "drizzle-orm";
import {
    boolean,
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
    catalogSchema: jsonb("catalog_schema"),
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
    })
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
    })
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
