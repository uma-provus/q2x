import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tenantOptionSetOptions, tenantOptionSets } from "@/db/schema";
import type { CatalogSettings, QuoteSettings } from "@/features/settings/types";

/**
 * Load catalog settings from tenant option sets
 */
export async function loadCatalogSettings(
    tenantId: string
): Promise<CatalogSettings> {
    // Load catalog_item_type option set
    const typeSet = await db.query.tenantOptionSets.findFirst({
        where: and(
            eq(tenantOptionSets.tenantId, tenantId),
            eq(tenantOptionSets.name, "catalog_item_type")
        ),
        with: {
            options: {
                where: eq(tenantOptionSetOptions.isActive, true),
                orderBy: (options, { asc }) => [asc(options.sortOrder)],
            },
        },
    });

    if (!typeSet) {
        throw new Error("Catalog item type option set not found");
    }

    // Load catalog_item_unit option set
    const unitSet = await db.query.tenantOptionSets.findFirst({
        where: and(
            eq(tenantOptionSets.tenantId, tenantId),
            eq(tenantOptionSets.name, "catalog_item_unit")
        ),
        with: {
            options: {
                where: eq(tenantOptionSetOptions.isActive, true),
                orderBy: (options, { asc }) => [asc(options.sortOrder)],
            },
        },
    });

    return {
        types: typeSet.options.map((opt, idx) => ({
            id: opt.id,
            name: opt.label,
            key: opt.optionKey,
            isStandard: true,
            color: opt.color || "#000000",
        })),
        unitTypes: unitSet
            ? unitSet.options.map((opt, idx) => ({
                id: opt.id,
                name: opt.label,
                key: opt.optionKey,
                enabled: true,
            }))
            : [
                { id: "1", name: "Hourly", key: "hourly", enabled: true },
                { id: "2", name: "Daily", key: "daily", enabled: true },
                { id: "3", name: "Monthly", key: "monthly", enabled: true },
                { id: "4", name: "Fixed", key: "fixed", enabled: true },
            ],
    };
}

/**
 * Load quote settings from tenant option sets
 */
export async function loadQuoteSettings(tenantId: string): Promise<QuoteSettings> {
    // Load quote_status option set
    const statusSet = await db.query.tenantOptionSets.findFirst({
        where: and(
            eq(tenantOptionSets.tenantId, tenantId),
            eq(tenantOptionSets.name, "quote_status")
        ),
        with: {
            options: {
                where: eq(tenantOptionSetOptions.isActive, true),
                orderBy: (options, { asc }) => [asc(options.sortOrder)],
            },
        },
    });

    if (!statusSet) {
        throw new Error("Quote status option set not found");
    }

    return {
        statuses: statusSet.options.map((opt) => ({
            id: opt.id,
            name: opt.label,
            key: opt.optionKey,
            isStandard: true,
            color: opt.color || "#000000",
            order: opt.sortOrder,
        })),
    };
}
