import { z } from "zod";

export const catalogTypeSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    key: z.string(), // Immutable identifier
    isStandard: z.boolean().default(false),
    color: z.string().default("#000000"),
});

export const unitTypeSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    key: z.string(),
    enabled: z.boolean().default(true),
});

export const quoteStatusSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    key: z.string(),
    isStandard: z.boolean().default(false),
    color: z.string().default("#000000"),
    order: z.number(),
});

export const catalogSettingsSchema = z.object({
    types: z.array(catalogTypeSchema),
    unitTypes: z.array(unitTypeSchema),
});

export const quoteSettingsSchema = z.object({
    statuses: z.array(quoteStatusSchema),
});

export type CatalogSettings = z.infer<typeof catalogSettingsSchema>;
export type QuoteSettings = z.infer<typeof quoteSettingsSchema>;

export const DEFAULT_CATALOG_SETTINGS: CatalogSettings = {
    types: [
        { id: "1", name: "Resource Role", key: "resource_role", isStandard: true, color: "#3b82f6" }, // blue-500
        { id: "2", name: "Product", key: "product", isStandard: true, color: "#10b981" }, // emerald-500
        { id: "3", name: "Add On", key: "add_on", isStandard: true, color: "#f59e0b" }, // amber-500
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

export const DEFAULT_QUOTE_SETTINGS: QuoteSettings = {
    statuses: [
        { id: "1", name: "Draft", key: "draft", isStandard: true, color: "#6b7280", order: 0 }, // gray-500
        { id: "2", name: "Pending Approval", key: "pending_approval", isStandard: true, color: "#f59e0b", order: 1 }, // amber-500
        { id: "3", name: "Approved", key: "approved", isStandard: true, color: "#10b981", order: 2 }, // emerald-500
        { id: "4", name: "Rejected", key: "rejected", isStandard: true, color: "#ef4444", order: 3 }, // red-500
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
