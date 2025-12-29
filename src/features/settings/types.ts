import { z } from "zod";

export const catalogTypeSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    key: z.string(), // Immutable identifier
    isStandard: z.boolean().default(false),
});

export const unitTypeSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    key: z.string(),
    enabled: z.boolean().default(true),
});

export const catalogSettingsSchema = z.object({
    types: z.array(catalogTypeSchema),
    unitTypes: z.array(unitTypeSchema),
});

export type CatalogSettings = z.infer<typeof catalogSettingsSchema>;

export const DEFAULT_CATALOG_SETTINGS: CatalogSettings = {
    types: [
        { id: "1", name: "Resource Role", key: "resource_role", isStandard: true },
        { id: "2", name: "Product", key: "product", isStandard: true },
        { id: "3", name: "Add On", key: "add_on", isStandard: true },
    ],
    unitTypes: [
        { id: "1", name: "Flat", key: "flat", enabled: true },
        { id: "2", name: "Hourly", key: "hourly", enabled: true },
        { id: "3", name: "Weekly", key: "weekly", enabled: true },
        { id: "4", name: "Monthly", key: "monthly", enabled: true },
        { id: "5", name: "Quarterly", key: "quarterly", enabled: true },
        { id: "6", name: "Yearly", key: "yearly", enabled: true },
    ],
};

export const notificationsSettingsSchema = z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    marketing: z.boolean().default(false),
    security: z.boolean().default(true),
});

export type NotificationsSettings = z.infer<typeof notificationsSettingsSchema>;

export const DEFAULT_NOTIFICATIONS_SETTINGS: NotificationsSettings = {
    email: true,
    push: false,
    marketing: false,
    security: true,
};
