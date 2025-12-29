import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
    type CatalogSettings,
    catalogSettingsSchema,
    DEFAULT_CATALOG_SETTINGS,
} from "../types";

export async function getCatalogSettings(): Promise<CatalogSettings> {
    const session = await auth();
    if (!session?.user?.tenantId) {
        // For now, return default if no session (or handle error appropriately)
        // In a real app, this should probably redirect or throw
        return DEFAULT_CATALOG_SETTINGS;
    }

    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, session.user.tenantId),
        columns: {
            catalogSchema: true,
        },
    });

    if (!tenant?.catalogSchema) {
        return DEFAULT_CATALOG_SETTINGS;
    }

    // Validate and return
    const parsed = catalogSettingsSchema.safeParse(tenant.catalogSchema);
    if (parsed.success) {
        return parsed.data;
    }

    return DEFAULT_CATALOG_SETTINGS;
}
