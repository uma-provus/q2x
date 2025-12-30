"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenantOptionSetOptions, tenantOptionSets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { type CatalogSettings, catalogSettingsSchema } from "../types";

export async function updateCatalogSettings(data: CatalogSettings) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        return { error: "Unauthorized" };
    }

    const parsed = catalogSettingsSchema.safeParse(data);

    if (!parsed.success) {
        return { error: "Invalid data" };
    }

    try {
        // Update types in catalog_item_type option set
        const typeSet = await db.query.tenantOptionSets.findFirst({
            where: and(
                eq(tenantOptionSets.tenantId, session.user.tenantId),
                eq(tenantOptionSets.name, "catalog_item_type"),
            ),
        });

        if (typeSet) {
            // Update existing options
            for (const type of parsed.data.types) {
                await db
                    .update(tenantOptionSetOptions)
                    .set({
                        label: type.name,
                        color: type.color,
                    })
                    .where(
                        and(
                            eq(tenantOptionSetOptions.optionSetId, typeSet.id),
                            eq(tenantOptionSetOptions.optionKey, type.key),
                        ),
                    );
            }
        }

        // Update unit types in catalog_item_unit option set
        const unitSet = await db.query.tenantOptionSets.findFirst({
            where: and(
                eq(tenantOptionSets.tenantId, session.user.tenantId),
                eq(tenantOptionSets.name, "catalog_item_unit"),
            ),
        });

        if (unitSet) {
            // Update existing options
            for (const unit of parsed.data.unitTypes) {
                await db
                    .update(tenantOptionSetOptions)
                    .set({
                        label: unit.name,
                    })
                    .where(
                        and(
                            eq(tenantOptionSetOptions.optionSetId, unitSet.id),
                            eq(tenantOptionSetOptions.optionKey, unit.key),
                        ),
                    );
            }
        }

        revalidatePath("/catalogs");
        return { success: true };
    } catch (error) {
        console.error("Failed to update catalog settings:", error);
        return { error: "Failed to update settings" };
    }
}
